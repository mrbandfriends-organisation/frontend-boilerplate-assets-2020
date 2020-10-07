/**
 * Breakpoint Observer: allows you to trigger events based on the browser being resized to certain breakpoints. This
 * is useful for conditionally binding behaviour based on instantaneous window size.
 *
 * See the public API below.
 */
import bpt from 'breakpoint-tools';

function BreakpointObserver() {
    'use strict';
    var aoCallbacks = [];
    var bLock = false;

    function attemptMatch(oCallback) {
        // 1. if we match our criteria
        if (
            (oCallback.match === 'match' && bpt.match(oCallback.breakpoint)) ||
            (oCallback.match === 'larger' &&
                bpt.matchLarger(oCallback.breakpoint)) ||
            (oCallback.match === 'smaller' &&
                bpt.matchSmaller(oCallback.breakpoint))
        ) {
            // we’re grooy: call the callback
            oCallback.callback({
                requested: oCallback.breakpoint,
                matched: bpt.current()
            });
            return true;
        }

        // 2. otherwise, bail
        return false;
    }

    function fnHandleResize() {
        // 0. locking
        if (bLock) {
            return;
        }
        bLock = true;

        // 1. try matching each of the callbacks
        aoCallbacks = aoCallbacks.filter(function(oCallback) {
            return !attemptMatch(oCallback);
        });

        // 2. if there’s nothing left, unbind ourselves
        if (aoCallbacks.length === 0) {
            window.removeEventListener('resize', fnHandleResize);
        }

        // 3. unlock
        setTimeout(function() {
            bLock = false;
        }, 50);
    }

    function bindCallback(sBreakpoint, sMatch, fnCallback, bImmediate) {
        // 0. default the immediate flag
        if (bImmediate === undefined) {
            bImmediate = false;
        }

        // 1. construct our item
        var oTmp = {
            breakpoint: sBreakpoint,
            match: sMatch.toLowerCase(),
            callback: fnCallback
        };

        // 2. try for an immediate match. If not, fall out
        if (!bImmediate || !attemptMatch(oTmp)) {
            // a. push it onto the list
            aoCallbacks.push(oTmp);

            // b. bind things
            if (aoCallbacks.length === 1) {
                window.addEventListener('resize', fnHandleResize);
            }
        }

        // 3. done!
        return true;
    }

    return bindCallback;
}

var oInstance = null;
function getInstance() {
    'use strict';
    if (oInstance === null) {
        oInstance = new BreakpointObserver();
    }

    return oInstance;
}

/** Public API */
module.exports = {
    /**
     * Call the provided function when the browser is resized to the given breakpoint.
     *
     * @param   sBreakpoint     the breakpoint to trigger on
     * @param   fnCallback      the function to call
     * @param   bImmediate      (optional) when true, assess the screen size immediately (default: false)
     * @return  true
     */
    whenMatches: function(sBreakpoint, fnCallback, bImmediate) {
        'use strict';
        return getInstance()(sBreakpoint, 'equal', fnCallback, bImmediate);
    },

    /**
     * Call the provided function when the browser is resized to the given breakpoint or larger.
     *
     * @param   sBreakpoint     the breakpoint to trigger on
     * @param   fnCallback      the function to call
     * @param   bImmediate      (optional) when true, assess the screen size immediately (default: false)
     * @return  true
     */
    whenLarger: function(sBreakpoint, fnCallback, bImmediate) {
        'use strict';
        return getInstance()(sBreakpoint, 'larger', fnCallback, bImmediate);
    },

    /**
     * Call the provided function when the browser is resized to the given breakpoint or smaller.
     *
     * @param   sBreakpoint     the breakpoint to trigger on
     * @param   fnCallback      the function to call
     * @param   bImmediate      (optional) when true, assess the screen size immediately (default: false)
     * @return  true
     */
    whenSmaller: function(sBreakpoint, fnCallback, bImmediate) {
        'use strict';
        return getInstance()(sBreakpoint, 'smaller', fnCallback, bImmediate);
    }
};
