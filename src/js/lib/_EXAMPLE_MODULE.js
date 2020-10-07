/**
 * EXAMPLE MODULE
 *
 * description of the default module
 */

import applyMixins from 'apply-mixins';
// import triggerCallback from 'mixins/trigger-callback';

const apiSelector = '.js-example-selector';

/**
 * CONSTRUCTOR
 * initialises the object
 */
class MODULE_NAME {
    constructor(el, options) {
        this.el = el;
        this.$el = $(el);

        // Options
        this.settings = Object.assign({}, options);

        this.init();
    }

    init() {
        this.addListeners();
    }

    addListeners() {}

    privateMethod() {}
}

/**
 * DATA API
 * initialises a new instance on all elements that match the selector
 */
$(apiSelector).each(function() {
    'use strict';
    var $this = $(this);

    // Check if this has been initialized
    if ($this.data('mrb-module-initialized')) {
        return true;
    }

    // Mark as initialized
    $this.data('mrb-module-initialized', true);

    // Instantiate new SmoothScroll on this unique element
    new MODULE_NAME($this);
});

// Apply Mixins
// applyMixins(VideoPlayer, triggerCallback);

// Export
export default MODULE_NAME;
