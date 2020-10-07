module.exports = (function() {
    'use strict';
    /**
     * Add a toArray function to NodeList, to make the [].slice.call() thing a little less obscure.
     */
    NodeList.prototype.toArray = function() {
        return [].slice.call(this);
    };

    /**
     * Shim an 'each' function. I would call this 'forEach', but Chrome already has one of those which isn’t in the
     * spec, so I’m going to make it really obviously different
     */
    NodeList.prototype.each = function(fCallback) {
        return this.toArray().forEach(fCallback);
    };
})();
