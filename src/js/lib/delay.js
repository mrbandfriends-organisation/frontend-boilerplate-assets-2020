'use strict';

function delay(time) {
    return new Promise(function(fulfill) {
        setTimeout(fulfill, time);
    });
}

export default delay;
