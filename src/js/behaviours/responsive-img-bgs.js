'use strict';

/**
 * RESPONSIVE CSS IMAGE BACKGROUNDS
 */
import RImgBg from 'lib/rimg-bg';

$(window).on('load', () => {
    $('.js-rimgbg').each((index, el) => {
        new RImgBg($(el));
    });
});
