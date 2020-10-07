import Tabs from 'lib/tabs';
import EventBus from 'pubsub-js';

new Tabs('.js-tabs', {
    onTabOpen: function(tabs_instance, data) {
        EventBus.publish('tabs:tab-opened', {
            instance: tabs_instance
        });
    },
    scrollToTab: function(tabs_instance, data) {},
    afterInit: function(tabs_instance, data) {}
});
