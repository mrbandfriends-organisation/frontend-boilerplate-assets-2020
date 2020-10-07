'use strict';

import Toggler from 'mrb/mrb-toggle';
import logger from 'lib/logger';

/**
 *
 * GROUP TOGGLER
 *
 * Toggler useful for toggling
 * multiple elments on one page. e.g
 * When you want to display a list of items with
 * information contained in hidden content areas.
 * Use this to trigger the showing/hiding of each
 * lists items own information
 *
 */

class GroupToggler {
    constructor(el, options) {
        this.el = el;
        this.togglers = {};

        // Options
        this.settings = Object.assign(
            {
                toggleTrigger: '.js-toggle',
                toggleTargetIdSource: 'data-key', // Set to id by default - Could be swapped out for data attr e.g data-target-id
                togglerEls: Array.from(this.el.querySelectorAll('.js-toggle'))
            },
            options
        );

        if (this.settings.togglerEls.length === 0) {
            logger("There are no toggle elements(li's) in your toggler");
        }

        this.init();
    }

    init() {
        // A map of Toggle instances by id
        this.togglers = this.settings.togglerEls.reduce((acc, curr) => {
            // Grab ID from DOM and use as dynamic key on the object
            acc[
                curr.getAttribute(this.settings.toggleTargetIdSource)
            ] = new Toggler(curr, {
                // Stop indvidiual togglers adding their own
                // event listeners as we now handle in the Group Toggler
                shouldAddListeners: false
            });

            return acc;
        }, {});

        this.addListeners();
    }

    addListeners() {
        this.el.addEventListener('click', event => {
            this.handleClick(event);
        });
    }

    handleClick(event) {
        if (event.target && event.target.closest(this.settings.toggleTrigger)) {
            // check the target is deffo what we need
            event.preventDefault();
            event.stopPropagation(); // stop event bubbling up further into the DOM

            // Find the closest el with the class
            // .js-toggle to where was clicked and set the Id
            let targetId = event.target
                .closest('.js-toggle')
                .getAttribute(this.settings.toggleTargetIdSource);

            // Close all Open .js-toggle-target divs
            this.closeAll();

            // Use the ID to Open the relevant target
            this.open(targetId);
        }
    }

    open(id) {
        this.togglers[id].open();
    }

    close(id) {
        this.togglers[id].close();
    }

    openAll() {
        Object.keys(this.togglers).forEach(key => this.togglers[key].open());
    }

    closeAll() {
        Object.keys(this.togglers).forEach(key => this.togglers[key].close());
    }
}

// Export
export default GroupToggler;
