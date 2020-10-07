/**
 * RESPONSIVE IMAGES BACKGROUNDS
 * utility to allow for true responsive images on CSS backgrounds
 * when the srcs are coming from a content management system.
 *
 * Relies on native Responsive Image implementation to parse the image
 * details from the srcset attribute and set them on the wrapping element's
 * style attribute.
 *
 * Assumes you will set
 * background: no-repeat 50% 50%; background-size: cover;
 */

class RImgBg {
    constructor(el) {
        this.el = el;
        this.$el = $(el);

        if (!this.$el.length) {
            return false;
        }

        this.init(this.el);
    }

    init($this) {
        // Grab the first image which has a srcset
        const targetImg = $this.children('img').eq(0);

        if (!targetImg[0]) {
            return;
        }
        // Grab the currentSrc or src
        const src = targetImg[0].currentSrc || targetImg[0].src;

        // Set the CSS background via inline style
        this.setBgImg($this, src);

        $this.addClass('-img-active');

        // Remove the original image from the DOM
        targetImg.hide();
    }

    setBgImg(el, src) {
        el.css('background-image', 'url(' + src + ')');
    }
}

// Export
export default RImgBg;
