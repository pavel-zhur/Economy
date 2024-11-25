const BUTTON_TEXT_START = 'Transcribe Audio';
const BUTTON_TEXT_STOP = 'Recording... Stop';
const SILENCE_THRESHOLD = 0.02; // Adjust this value as needed
const SILENCE_TIMEOUT = 1300; // 1.3 seconds
const HOLD_THRESHOLD = 300; // 300ms

let mediaRecorder;
let silenceTimer;
let idleProgress = 0;
let silenceDetection = true;

const transcribeButton = document.getElementById('transcribeButton');
const micLockButton = document.getElementById('micLock');
const statusBar = document.getElementById('statusBar');
const mic1Button = document.getElementById('micStartButton');
const silenceProgress = document.getElementById('silenceProgress');

micLockButton.addEventListener('click', () => {
    silenceDetection = false;
});

transcribeButton.addEventListener('click', () => {
    if (transcribeButton.innerText === BUTTON_TEXT_STOP) {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            console.log('Stopping recording');
            mediaRecorder.stop();
        }
    } else {
        console.log('Starting recording');
        silenceDetection = true;
        startRecording();
    }
});

async function startRecording() {
    if (transcribeButton.innerText === BUTTON_TEXT_STOP) {
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

    const hexToRgb = hex => {
        // Remove the hash at the start if it's there
        hex = hex.replace(/^#/, '');

        // Parse the r, g, b values
        let bigint = parseInt(hex, 16);
        let r = (bigint >> 16) & 255;
        let g = (bigint >> 8) & 255;
        let b = bigint & 255;

        return { r, g, b };
    }

    const setVolumeColor = colorIntensity => {
        const startColor = hexToRgb('#ffb0c8');
        const endColor = hexToRgb('#9c002f');

        const r = Math.round(startColor.r + colorIntensity * (endColor.r - startColor.r));
        const g = Math.round(startColor.g + colorIntensity * (endColor.g - startColor.g));
        const b = Math.round(startColor.b + colorIntensity * (endColor.b - startColor.b));

        mic1Button.style.backgroundColor = `rgb(${r}, ${g}, ${b})`; // Gradient from #ffb0c8 to #c4023d
    }

    const setSilenceProgress = progress => {
        silenceProgress.style.setProperty('--progress', progress);
    }

    const detectSilence = () => {
        analyser.getByteTimeDomainData(dataArray);
        const isSilent = dataArray.every(value => Math.abs(value - 128) < SILENCE_THRESHOLD * 128);

        if (silenceDetection && isSilent) {
            if (!silenceTimer) {
                silenceStartTime = Date.now();
                silenceTimer = setTimeout(() => {
                    if (mediaRecorder.state === 'recording') {
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
                    setSilenceProgress(progress);
                } else {
                    statusBar.innerText = 'Listening1...';
                    setSilenceProgress(0);
                    setVolumeColor(0);
                }
            }
        } else {
            clearTimeout(silenceTimer);
            silenceTimer = null;
            idleProgress = 0;

            if (mediaRecorder.state === 'recording') {
                // Reset status bar immediately when sound is detected
                statusBar.innerText = 'Listening2...';
                setSilenceProgress(0);

                // Calculate the average volume
                const sum = dataArray.reduce((a, b) => a + Math.abs(b - 128), 0);
                const average = sum / dataArray.length;
                const intensity = Math.min(1, average / 128); // Normalize intensity to range [0, 1]

                // Change background color based on intensity
                const colorIntensity = Math.min(1, Math.pow(intensity, 0.2) / .7); // Ensure colorIntensity does not exceed 1

                setVolumeColor(colorIntensity);
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
        transcribeButton.innerText = BUTTON_TEXT_START;
        statusBar.innerText = 'Transcribing...';
        setSilenceProgress(0);
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
        mic1Button.style.backgroundColor = '';
    };

    mediaRecorder.start();

    detectSilence();

    // Change transcribeButton text to "Recording... Stop"
    transcribeButton.innerText = BUTTON_TEXT_STOP;
    statusBar.innerText = 'Listening...';
    statusBar.style.color = 'green';
    transcribeButton.style.backgroundColor = ''; // Reset background color when starting a new recording
}
