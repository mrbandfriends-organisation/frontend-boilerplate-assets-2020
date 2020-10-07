'use strict';
/**
 * TRIGGER CALLBACK
 *
 * provides ability to trigger a named callback function which is passed in as a "setting"
 */


export default {
    triggerCallback(eventName) {
        if (this.settings === undefined) {
            return;
        }

        if (this.settings[eventName] !== undefined && typeof this.settings[eventName] === 'function') {
            this.settings[eventName](this);
        }
    }
};