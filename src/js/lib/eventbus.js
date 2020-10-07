'use strict';
/**
 * EVENT BUS
 *
 * acts as a wrapper around a simple pub-sub implementation
 * this avoids coupling our code to any one implementation 
 * should we wish to change it out in the future
 *
 * include the EventBus and publish/subscribe to events as 
 * required to avoid coupling modules to each other or to 
 * broadcast app-wide events
 */

import PubSub from 'pubsub-js';

export default {
    publish(topic, payload) {
        PubSub.publish(topic, payload);
    },

    subscribe(topic, fn) {
        PubSub.subscribe(topic, fn);
    }
};
