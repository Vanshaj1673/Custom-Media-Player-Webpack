import './scss/main.scss';
import { initVideoPlayer } from './js/video-player';

import videoSrc from './assets/media/sample_video.mp4';

document.addEventListener('DOMContentLoaded', () => {
    const videoElement = document.querySelector('#video');
    if (videoElement) {
        videoElement.src = videoSrc;

        initVideoPlayer({
            videoElement: "#video",
            container: "#video-wrapper",
            controls: {
                volume: true,
                fullscreen: true,
                playbackSpeed: true
            },
            defaults: {
                volume: 0.8,
                speed: 1
            }
        });
    }
});

export { initVideoPlayer };
