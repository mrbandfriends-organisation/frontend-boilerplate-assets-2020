'use strict';
/**
 * INLINE VIDEO
 *
 * videos that play inline within the contnet of a page
 * (as opposed to full screen background videos)
 * 
 * supports:
 * 	- youtube
 * 	- vimeo
 * 	- direct video files
 *
 * utilises:
 * https://github.com/sampotts/plyr
 *
 * To apply styles you will need to uncomment the `vendors/plyr` line
 * in the main.scss file
 *
 * To control the generated markup checkout
 * https://github.com/sampotts/plyr/blob/master/controls.md#controls
 */

import plyr from 'plyr';

plyr.setup(document.querySelectorAll('.js-inline-video'), {
    // Load the controls SVG sprite from our server not their CDN
    // https://github.com/sampotts/plyr#svg
    iconUrl: `${LOCALISED_VARS.stylesheet_directory_uri}/assets/svg/vendors/plyr/plyr.svg`
});
