'use strict';

/**
 * GROUP TOGGLE
 *
 */

import GroupToggler from 'mrb/mrb-group-toggler';

const togglerGroups = document.querySelectorAll('.js-toggler-group');

togglerGroups.forEach(togglerGroup => {
    new GroupToggler(togglerGroup);
});
