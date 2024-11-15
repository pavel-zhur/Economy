document.addEventListener("DOMContentLoaded", () => {
    const animationElement = document.querySelector('div.animated-background div.animation');

    if (animationElement) {
        const keyframes = [
            { backgroundPositionX: '0px' },
            { backgroundPositionX: '-10792px' }
        ];

        const timing = {
            duration: 3600000,
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

        function adjustPlaybackRate(targetRate, easingFunction, adjustmentDuration) {
            const currentRate = animation.playbackRate;
            const rateDifference = targetRate - currentRate;
            let startTime = null;

            function updatePlaybackRate(timestamp) {
                if (!startTime) startTime = timestamp;
                const elapsed = timestamp - startTime;
                const progress = Math.min(elapsed / adjustmentDuration, 1);
                const easedProgress = easingFunction(progress); // Apply easing curve
                animation.playbackRate = currentRate + rateDifference * easedProgress;

                if (progress < 1) {
                    requestAnimationFrame(updatePlaybackRate);
                }
            }

            requestAnimationFrame(updatePlaybackRate);
        }

        window.speedUpAnimation = () => adjustPlaybackRate(250, easeInOutCubicBezier, 500);
        window.slowDownAnimation = () => adjustPlaybackRate(1, easeOutCubic, 1000);
    } else {
        console.warn("Animation element not found.");
    }
});
