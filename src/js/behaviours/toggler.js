'use strict';

/**
 * PROPERTY TOGGLE
 * manages the toggling of Property tiles
 */

// Class
import Toggle from 'mrb/mrb-toggle';

$('.js-toggle').each(function(e) {
    const $this = $(this);

    // Parent Property component
    const toggleTarget = $this.next('.js-toggle-target');

    new Toggle($this, {
        toggleTarget: toggleTarget,
        focusTarget: this
    });
});
