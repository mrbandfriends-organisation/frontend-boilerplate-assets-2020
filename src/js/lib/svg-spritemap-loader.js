'use strict';
/**
 * SVG SPRITEMAP
 * XHR load in a spritesheet
 */

class SVGSpriteLoader {
    constructor(url) {
        this.url = url;
        this.loadSpriteSheet();
    }

    loadSpriteSheet() {
        const self = this;
        let request = new XMLHttpRequest();
        request.open('GET', this.url, true);

        request.onreadystatechange = function() {
            if (this.readyState === 4) {
                if (this.status >= 200 && this.status < 400) {
                    self._insertSpriteSheet(request.responseText);
                }
            }
        };

        request.send();

        request.onerror = function() {
            if (LOCALISED_VARS.env !== 'production') {
                console.warn('Spritesheet loader error: ' + xhr.status); // eslint-disable-line no-console, no-undef
            }
        };
    }

    _insertSpriteSheet(sheet) {
        let div = document.createElement('div');
        div.style.display = 'none';
        div.setAttribute('aria-hidden', true);
        div.innerHTML = sheet;
        document.body.insertBefore(div, document.body.childNodes[0]);
    }
}

// Export
export default SVGSpriteLoader;
