document.addEventListener('DOMContentLoaded', function () {

    const SILENCE_THRESHOLD = 0.02; // Adjust this value as needed
    const SILENCE_TIMEOUT = 1300; // 1.3 seconds

    let mediaRecorder;
    let silenceTimer;
    let silenceDetection = true;
    let isRecording = false;
    let shouldSend = false;

    const micStartButton = document.getElementById('micStartButton'); // hotkey: M
    const micCancelButton = document.getElementById('micCancelButton'); // hotkey: esc
    const micSubmitButton = document.getElementById('micSubmitButton'); // hotkey: enter
    const silenceProgress = document.getElementById('silenceProgress');
    const micButtonsContainer = document.getElementById('micButtonsContainer');

    document.addEventListener('keydown', function (event) {
        if (!document.activeElement.matches('input, textarea') || isRecording) {
            if (event.key === 'm' || event.key === 'M') {
                micStartButton.click();
                event.preventDefault();
            } else if (event.key === 'Escape') {
                micCancelButton.click();
                event.preventDefault();
            } else if (event.key === 'Enter') {
                micSubmitButton.click();
                event.preventDefault();
            } else if (event.key >= 0 && event.key <= 9) {
                const index = parseInt(event.key);
                const chatMessage = document.querySelector(`button[hotKey="${index}"]`);
                if (chatMessage) {
                    chatMessage.click();
                    event.preventDefault();
                }
            }
        }
    });

    micStartButton.addEventListener('click', () => {
        if (isRecording) {
            console.log('Silence detection off');
            silenceDetection = false;
            setRecordingStatus('locked');
        } else {
            console.log('Starting recording');
            isRecording = true;
            silenceDetection = true;
            shouldSend = true;
            startRecording();
        }
    });

    micCancelButton.addEventListener('click', () => {
        if (isRecording) {
            console.log('Cancelling recording');
            isRecording = false;
            shouldSend = false;
            mediaRecorder.stop();
        }
    });

    micSubmitButton.addEventListener('click', () => {
        if (isRecording) {
            console.log('Stopping recording');
            isRecording = false;
            shouldSend = true;
            mediaRecorder.stop();
        }
    });

    const setRecordingStatus = status => {
        micButtonsContainer.classList.remove('mic-buttons-container-recording');
        micButtonsContainer.classList.remove('mic-buttons-container-locked');
        micButtonsContainer.classList.remove('mic-buttons-container-idle');
        micButtonsContainer.classList.remove('mic-buttons-container-denied');
        micButtonsContainer.classList.remove('mic-buttons-container-initializing');
        micButtonsContainer.classList.add(`mic-buttons-container-${status}`);
        micStartButton.style.backgroundColor = '';
    };

    async function startRecording() {
        console.log('startRecording');
        // Show initializing status
        setRecordingStatus('initializing');

        // Clear any existing silence timer
        clearTimeout(silenceTimer);

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true }).catch(error => {
            console.error('Error accessing microphone:', error);
            setRecordingStatus('denied');
            isRecording = false;
            return;
        });
        if (!stream) return;

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

            micStartButton.style.backgroundColor = `rgb(${r}, ${g}, ${b})`; // Gradient from #ffb0c8 to #c4023d
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
                        setSilenceProgress(progress);
                    } else {
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

        mediaRecorder.onerror = event => {
            console.error('MediaRecorder error:', event.error);
            setRecordingStatus('idle');
            isRecording = false;
        };

        mediaRecorder.ondataavailable = event => {
            console.log('ondataavailable');
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
            console.log('onstop');

            // Stop all tracks of the media stream
            stream.getTracks().forEach(track => track.stop());
            audioContext.close();

            // Reset UI immediately
            setSilenceProgress(0);
            setRecordingStatus('idle');
            isRecording = false;

            if (!shouldSend) {
                console.log('Recording was cancelled. Data will not be sent.');
                return; // Exit if recording was cancelled
            }

            // Convert audio blob to byte array
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            const arrayBuffer = await audioBlob.arrayBuffer();
            const byteArray = new Uint8Array(arrayBuffer);

            try {
                // Invoke SignalR method to send audio
                await window.chatsComponent.sendAudio(byteArray);
                console.log('Audio sent successfully');
            } catch (error) {
                console.error('Error sending audio:', error);
            }

            // Reset status bar
            micStartButton.style.backgroundColor = '';
        };

        mediaRecorder.start();

        detectSilence();

        setRecordingStatus('recording');
    }

});