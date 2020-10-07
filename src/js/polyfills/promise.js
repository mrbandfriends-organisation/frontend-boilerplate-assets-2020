'use strict';

// Promise polyfill
// https://github.com/taylorhakes/promise-polyfill
import PromisePolyfill from 'promise-polyfill';
import setAsap from 'setasap';
window.Promise = PromisePolyfill;
Promise._immediateFn = setAsap;
