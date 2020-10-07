'use strict';

/**
 * SOCIAL SHARING
 *
 * Social sharing buttons
 */

// Class
import SocialSharing from 'lib/social-sharing';

const trigger = document.querySelector('.js-share-btn');
const container = document.querySelector('.js-share-container');

// Calling function. Needs to arguments;
//  - `trigger`   = The element that is clicked on to trigger the social network icon list
//  - `container` = The element that contains the social network icon list
SocialSharing(trigger, container);
