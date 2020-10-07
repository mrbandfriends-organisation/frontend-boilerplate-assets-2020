'use strict';

import EventBus from 'lib/eventbus';

import applyMixins from 'lib/apply-mixins';
import focusManager from 'lib/mixins/focus-manager';

/**
 * OFFCANVAS TOGGLER
 * manages toggling of offcanvas elements
 */

class OffCanvasToggler {
    constructor(options) {
        this.focus;
        this.options = Object.assign({}, this.getDefaults(), options);

        this.opened = false;
        this.transitioning = false;

        this.wrapper = document.querySelector(this.options.wrapper);
        this.menu = this.wrapper.querySelector(this.options.menu);
        this.body = this.wrapper.querySelector(this.options.body);
        this.button = this.wrapper.querySelector(this.options.button);
        this.content = this.wrapper.querySelector(this.options.content);

        this.handleEscapeKey = this.handleEscapeKey.bind(this);

        if (this.menu && this.button) {
            this.init();
        }
    }

    init() {
        this.addListeners();
    }

    addListeners() {
        document.addEventListener('click', e => {
            let element = e.target.closest('button');

            if (element && element.matches(this.options.button)) {
                this.toggle();
            } else if (this.opened && this.body.contains(e.target)) {
                this.close();
            }
        });
    }

    handleEscapeKey(e) {
        if (e.key === 'Escape') {
            this.close();
        }
    }

    toggle() {
        if (!this.transitioning) {
            this.transitioning = true;
            transitionEnd(this.menu, () => (this.transitioning = false));

            if (!this.opened) {
                this.open();
            } else {
                this.close();
            }
        }
    }

    open() {
        this.wrapper.classList.add(this.options.activeClass);

        this.menu.setAttribute('aria-hidden', 'false');
        this.button.setAttribute('aria-expanded', 'true');
        this.opened = true;

        document.addEventListener('keyup', this.handleEscapeKey);

        transitionEnd(this.menu, () => this.focusOnFirstChild(this.content));

        EventBus.publish('offcanvastoggler:opened');
    }

    close() {
        this.wrapper.classList.remove(this.options.activeClass);

        document.removeEventListener('keyup', this.handleEscapeKey);

        this.menu.setAttribute('aria-hidden', 'true');
        this.button.setAttribute('aria-expanded', 'false');
        this.opened = false;

        this.focusOnPrevious();

        EventBus.publish('offcanvastoggler:closed');
    }

    getDefaults() {
        return {
            transitionDuration: 0,
            wrapper: '.js-offcanvas__wrapper',
            menu: '.js-primary-offcanvas',
            body: '.js-offcanvas-body',
            content: '.js-offcanvas-content',
            button: '.js-offcanvas-toggle',
            activeClass: 'is-active'
        };
    }
}

applyMixins(OffCanvasToggler, focusManager);

export default OffCanvasToggler;
