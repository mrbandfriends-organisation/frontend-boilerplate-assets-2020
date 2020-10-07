/**
 * SVG SPRITEMAP
 * loads SVG spritemap into the DOM for use with <use>
 * The following comment sets LOCALISED_VARS to be a global variable, as it is not defined in this file.
 */

import SVGSpriteLoader from 'lib/svg-spritemap-loader';

const spriteSheet = `${LOCALISED_VARS.stylesheet_directory_uri}/assets/${OUTPUT_DIR}/svg/sprites/${SVG_SPRITE_FILENAME}`;

new SVGSpriteLoader(spriteSheet);
