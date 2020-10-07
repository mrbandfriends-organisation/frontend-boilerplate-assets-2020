'use strict';
/**
 * BACKGROUND VIDEO
 *
 */

import BackgroundVideo from 'lib/background-video';

const backgroundVideos = Array.from(
    document.querySelectorAll('.js-background-video')
);

// IE11 doesn't support fitting the video so we just drop the video
// and fallback to an image
const supportsObjectFit = 'objectFit' in document.documentElement.style;

if (supportsObjectFit && backgroundVideos.length) {
    backgroundVideos.forEach(video => {
        new BackgroundVideo(video);
    });
}
