/* jshint strict:false */
/**
 * GOOGLE EVENT TRACKING
 * reusable method to allow GA Events to be defined using
 * data attributes in the DOM
 * The following comment sets ga to be a global variable, as it is not defined in this file.
 */
/* global ga */

class GATracker {
    constructor(selector) {
        if (window.ga === undefined) {
            return;
        }

        this.$root = $('body');
        this.selector = selector;

        this.init();
    }

    init() {
        this.addListeners();
    }

    addListeners() {
        this.$root.on('click change', this.selector, event =>
            this.handleTracking($(this), event)
        );
    }

    seekLinkElement(el) {
        /* Loop up the DOM tree through parent elements if clicked element is not a link (eg: an image inside a link) */
        while (
            el &&
            (typeof el.tagName === undefined ||
                el.tagName.toLowerCase() !== 'a' ||
                !el.href)
        ) {
            // jshint ignore:line
            el = el.parentNode;
        }

        return el;
    }

    trackEvent(data, event) {
        if (!(data.eventCategory && data.eventAction && data.eventLabel)) {
            return false;
        }

        let hbrun = false; // tracker has not yet run

        let el = this.seekLinkElement(event.srcElement || event.target);

        /* if a link has been clicked */
        if (el && el.href) {
            const href = el.href;

            /* HitCallback to open link in same window after tracker */
            const hitBack = () => {
                /* run once only */
                if (hbrun) return; // jshint ignore:line
                hbrun = true;
                window.location.href = href;
            };

            /* send event with callback */
            ga('send', 'event', {
                eventCategory: data.eventCategory,
                eventAction: data.eventAction,
                eventLabel: data.eventLabel,
                hitCallback: hitBack
            });

            /* Run hitCallback if GA takes too long */
            setTimeout(hitBack, 1000);

            /* Prevent standard click */
            event.preventDefault; // jshint ignore:line
        }
    }

    handleTracking($el, event) {
        let data = this.getData($el);

        if (!data.eventValue) {
            if ($el.is('select')) {
                data.eventValue = $el.children('option:selected').val();
            } else {
                data.eventValue = $el.html();
            }
        }

        this.trackEvent(data, event);
    }

    getData($el) {
        const eventCategory = $el.data('ga-category') || false;
        const eventAction = $el.data('ga-action') || false;
        const eventLabel = $el.data('ga-label') || false;
        const eventValue = $el.data('ga-value') || false;

        return {
            eventCategory: eventCategory,
            eventAction: eventAction,
            eventLabel: eventLabel,
            eventValue: eventValue
        };
    }
}

export default GATracker;
