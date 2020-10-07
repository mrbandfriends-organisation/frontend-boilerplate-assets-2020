'use strict';

export default {
    objectFitVideo() {
        // IE/Edge still don't support object-fit: cover
        if ('object-fit' in document.body.style) return;

        // Video's intrinsic dimensions
        const w = this.videoEl.videoWidth;
        const h = this.videoEl.videoHeight;
        let container = this.el;

        // Intrinsic ratio
        // Will be more than 1 if W > H and less if H > W
        var videoRatio = (w / h).toFixed(2);

        // Get the container DOM element and its styles
        //
        // Also calculate the min dimensions required (this will be
        // the container dimentions)
        const containerStyles = window.getComputedStyle(container);
        let minW = parseInt(containerStyles.getPropertyValue('width'));
        let minH = parseInt(containerStyles.getPropertyValue('height'));

        // If !border-box then add paddings to width and height
        if (containerStyles.getPropertyValue('box-sizing') !== 'border-box') {
            let paddingTop = containerStyles.getPropertyValue('padding-top');
            let paddingBottom = containerStyles.getPropertyValue(
                'padding-bottom'
            );
            let paddingLeft = containerStyles.getPropertyValue('padding-left');
            let paddingRight = containerStyles.getPropertyValue(
                'padding-right'
            );

            paddingTop = parseInt(paddingTop);
            paddingBottom = parseInt(paddingBottom);
            paddingLeft = parseInt(paddingLeft);
            paddingRight = parseInt(paddingRight);

            minW += paddingLeft + paddingRight;
            minH += paddingTop + paddingBottom;
        }

        // What's the min:intrinsic dimensions
        //
        // The idea is to get which of the container dimension
        // has a higher value when compared with the equivalents
        // of the video. Imagine a 1200x700 container and
        // 1000x500 video. Then in order to find the right balance
        // and do minimum scaling, we have to find the dimension
        // with higher ratio.
        //
        // Ex: 1200/1000 = 1.2 and 700/500 = 1.4 - So it is best to
        // scale 500 to 700 and then calculate what should be the
        // right width. If we scale 1000 to 1200 then the height
        // will become 600 proportionately.
        let widthRatio = minW / w;
        let heightRatio = minH / h;

        var new_width, new_height;

        // Whichever ratio is more, the scaling
        // has to be done over that dimension
        if (widthRatio > heightRatio) {
            new_width = minW;
            new_height = Math.ceil(new_width / videoRatio);
        } else {
            new_height = minH;
            new_width = Math.ceil(new_height * videoRatio);
        }

        this.videoEl.style.width = new_width + 'px';
        this.videoEl.style.height = new_height + 'px';
    }
};
