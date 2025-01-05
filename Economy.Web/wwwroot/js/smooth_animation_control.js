document.addEventListener("DOMContentLoaded", () => {
    const animationElements = document.querySelectorAll('div.animated-background div.animation');

    const speedUps = [];
    const slowDowns = [];

    for (var i = 0; i < animationElements.length; i++) {
        const animationElement = animationElements[i];
        const computedStyle = getComputedStyle(animationElement);
        const currentBgPosX = parseFloat(computedStyle.backgroundPositionX) || 0;

        const keyframes = [
            { backgroundPositionX: `${currentBgPosX - 10792 * ((i + 1) % 2)}px` },
            { backgroundPositionX: `${currentBgPosX - 10792 * (i % 2) }px` }
        ];

        const timing = {
            duration: 8000000 * (i + 1),
            iterations: Infinity,
            easing: 'linear'
        };

        const animation = animationElement.animate(keyframes, timing);
        animation.playbackRate = 1;

        function easeInOutCubicBezier(t) {
            return t < 0.5
                ? 4 * t * t * t
                : 1 - Math.pow(-2 * t + 2, 3) / 2;
        }

        function easeOutCubic(t) {
            return 1 - Math.pow(1 - t, 3);
        }

        let adjustPlaybackRateRequestID = null;

        function adjustPlaybackRate(targetRate, easingFunction, adjustmentDuration) {
            const currentRate = animation.playbackRate;
            const rateDifference = targetRate - currentRate;
            let startTime = null;

            if (adjustPlaybackRateRequestID !== null) {
                cancelAnimationFrame(adjustPlaybackRateRequestID);
                adjustPlaybackRateRequestID = null;
            }

            function updatePlaybackRate(timestamp) {
                if (!startTime) startTime = timestamp;
                const elapsed = timestamp - startTime;
                const progress = Math.min(elapsed / adjustmentDuration, 1);
                const easedProgress = easingFunction(progress);
                animation.playbackRate = currentRate + rateDifference * easedProgress;

                if (progress < 1) {
                    adjustPlaybackRateRequestID = requestAnimationFrame(updatePlaybackRate);
                } else {
                    adjustPlaybackRateRequestID = null;
                }
            }

            adjustPlaybackRateRequestID = requestAnimationFrame(updatePlaybackRate);
        }

        const iCopy = i;
        speedUps.push(() => adjustPlaybackRate(120 + (iCopy % 2) * 300, easeInOutCubicBezier, 500));
        slowDowns.push(() => adjustPlaybackRate(1, easeOutCubic, 1000));
    }

    window.speedUpAnimation = () => speedUps.forEach(speedUp => speedUp());
    window.slowDownAnimation = () => slowDowns.forEach(slowDown => slowDown());
});
