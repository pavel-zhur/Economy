const BUTTON_TEXT_START = 'Transcribe Audio';
const BUTTON_TEXT_STOP = 'Recording... Stop';
const SILENCE_THRESHOLD = 0.02; // Adjust this value as needed
const SILENCE_TIMEOUT = 1300; // 1.3 seconds
const HOLD_THRESHOLD = 300; // 300ms

let mediaRecorder;
let holdTimeout;
let isHolding = false;
let silenceTimer;
let idleProgress = 0;

const button = document.getElementById('transcribeButton');
const statusBar = document.getElementById('statusBar');

const startHoldTimeout = () => {
    console.log('startHoldTimeout');
    holdTimeout = setTimeout(() => {
        isHolding = true;
        console.log('Hold threshold reached, starting recording');
        startRecording(false);
    }, HOLD_THRESHOLD);
};

const clearHoldTimeout = () => {
    console.log('clearHoldTimeout');
    clearTimeout(holdTimeout);
    if (isHolding) {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            console.log('Stopping recording');
            mediaRecorder.stop();
        }
        isHolding = false;
    }
};

button.addEventListener('mousedown', () => {
    console.log('mousedown');
    startHoldTimeout();
});
button.addEventListener('mouseup', () => {
    console.log('mouseup');
    clearHoldTimeout();
});

button.addEventListener('touchstart', () => {
    console.log('touchstart');
    startHoldTimeout();
});
button.addEventListener('touchend', () => {
    console.log('touchend');
    clearHoldTimeout();
});

button.addEventListener('click', () => {
    console.log('click');
    if (!isHolding) {
        if (button.innerText === BUTTON_TEXT_STOP) {
            if (mediaRecorder && mediaRecorder.state === 'recording') {
                console.log('Stopping recording from click');
                mediaRecorder.stop();
            }
        } else {
            console.log('Starting recording from click');
            startRecording(true);
        }
    }
});

async function startRecording(withSilenceDetection) {
    if (button.innerText === BUTTON_TEXT_STOP) {
        return;
    }

    console.log('startRecording');
    // Show initializing status
    statusBar.innerText = 'Initializing...';
    statusBar.style.color = 'orange';

    // Clear any existing silence timer
    clearTimeout(silenceTimer);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
    const audioChunks = [];

    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    const dataArray = new Uint8Array(analyser.fftSize);
    source.connect(analyser);

    let silenceStartTime;

    const detectSilence = () => {
        analyser.getByteTimeDomainData(dataArray);
        const isSilent = dataArray.every(value => Math.abs(value - 128) < SILENCE_THRESHOLD * 128);

        if (!isHolding && isSilent) {
            if (!silenceTimer) {
                silenceStartTime = Date.now();
                silenceTimer = setTimeout(() => {
                    if (withSilenceDetection && mediaRecorder.state === 'recording') {
                        console.log('Silence detected, stopping recording');
                        mediaRecorder.stop();
                    }
                }, SILENCE_TIMEOUT);
            }

            if (mediaRecorder.state === 'recording') {
                const elapsed = Date.now() - silenceStartTime;
                const progress = Math.min(100, (elapsed / SILENCE_TIMEOUT) * 100);
                if (progress > 10) {
                    statusBar.innerText = `Listening, Idle ${Math.floor(progress / 10) * 10}%...`;
                } else {
                    statusBar.innerText = 'Listening...';
                }
            }
        } else {
            clearTimeout(silenceTimer);
            silenceTimer = null;
            idleProgress = 0;

            // Reset status bar immediately when sound is detected
            statusBar.innerText = 'Listening...';

            // Calculate the average volume
            const sum = dataArray.reduce((a, b) => a + Math.abs(b - 128), 0);
            const average = sum / dataArray.length;
            const intensity = Math.min(1, average / 128); // Normalize intensity to range [0, 1]

            if (mediaRecorder.state === 'recording') {
                // Change background color based on intensity
                const colorIntensity = Math.floor(Math.pow(intensity, 0.3) * 190);
                button.style.backgroundColor = `rgb(255, ${255 - colorIntensity}, ${255 - colorIntensity})`; // Gradient from green to red
            }
        }

        if (mediaRecorder.state === 'recording') {
            requestAnimationFrame(detectSilence);
        }
    };

    mediaRecorder.ondataavailable = event => {
        console.log('ondataavailable');
        audioChunks.push(event.data);
    };

    mediaRecorder.onstop = async () => {
        console.log('onstop');

        // Stop all tracks of the media stream
        stream.getTracks().forEach(track => track.stop());

        // Reset UI immediately
        button.innerText = BUTTON_TEXT_START;
        button.style.backgroundColor = 'lightyellow';
        statusBar.innerText = 'Transcribing...';
        statusBar.style.color = 'gray';

        // Convert audio blob to byte array
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const arrayBuffer = await audioBlob.arrayBuffer();
        const byteArray = new Uint8Array(arrayBuffer);

        try {
            // Invoke SignalR method to send audio
            await window.chatsComponent.sendAudio(byteArray);
            console.log('Audio sent successfully');
            statusBar.innerText = 'Audio sent successfully';
        } catch (error) {
            console.error('Error sending audio:', error);
            statusBar.innerText = 'Error occurred.';
        }

        // Reset status bar
        statusBar.innerText = 'Ready';
        button.style.backgroundColor = '';
    };

    mediaRecorder.start();

    detectSilence();

    // Change button text to "Recording... Stop"
    button.innerText = BUTTON_TEXT_STOP;
    statusBar.innerText = 'Listening...';
    statusBar.style.color = 'green';
    button.style.backgroundColor = ''; // Reset background color when starting a new recording
}
