'use strict';

import sassToJs from 'sass-to-js';

// Grab all the breakpoints as JSON from the DOM
let breakpoints = sassToJs(document.querySelector('body'), {
    pseudoEl: ':after',
    cssProperty: 'content'
});

// Map to array retaining key,value relationship
breakpoints = $.map(breakpoints, (value, key) => {
    return {
        name: key,
        size: value
    };
});

// Sort in order of breakpoint size in pixels (in place operation)
breakpoints.sort((x, y) => {
    return parseInt(x.size, 10) - parseInt(y.size, 10);
});

// Array of all breakpoints in size order - eg: ['tiny', 'small', 'medium'] ...etc
const aBreakpoints = $.map(breakpoints, bp => {
    return bp.name;
});

/**
 * Returns the current breakpoint
 */
function getCurrentBreakpoint() {
    return window
        .getComputedStyle(document.body, ':before')
        .content.replace(/[^a-z]/g, '');
}

/**
 * Returns true if the current browser state matches the given viewport
 */
function matchesCurrentBreakpoint(sBreakpoint) {
    return sBreakpoint === getCurrentBreakpoint();
}

/**
 * Returns true if the browser window is larger than the given viewport.
 */
function largerThanBreakpoint(sBreakpoint) {
    // 1. cast current and required breakpoints
    var iCurr = aBreakpoints.indexOf(getCurrentBreakpoint());
    var iTest = aBreakpoints.indexOf(sBreakpoint);

    var bpExists = iTest > 0;

    /* if (!bpExists) {
        console.warn(
            "Breakpoint Manager: you are checking for a breakpoint that doesn't exist"
        );
    } */

    // 2. return
    return bpExists && iCurr >= iTest;
}

/**
 * Returns true if the browser window is smaller than the given viewport.
 */
function smallerThanBreakpoint(sBreakpoint) {
    // 1. cast current and required breakpoints
    var iCurr = aBreakpoints.indexOf(getCurrentBreakpoint());
    var iTest = aBreakpoints.indexOf(sBreakpoint);

    var bpExists = iTest > 0;

    /* if (!bpExists) {
        console.warn(
            "Breakpoint Manager: you are checking for a breakpoint that doesn't exist"
        );
    } */

    // 2. return
    return bpExists && iCurr <= iTest;
}

const bpt = {
    breakpoints: aBreakpoints,
    current: getCurrentBreakpoint,
    match: matchesCurrentBreakpoint,
    matchLarger: largerThanBreakpoint,
    matchSmaller: smallerThanBreakpoint
};

export default bpt;
