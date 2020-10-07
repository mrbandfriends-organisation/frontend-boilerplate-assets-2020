import $ from 'jquery';
import applyMixins from 'lib/apply-mixins';
import triggerCallback from 'lib/mixins/trigger-callback';

var count = 1;

class Tabs {
    constructor($container, options) {
        var defaults = {
            autoScrollOnPopState: true,
            autoScrollOnLoad: true,
            autoScrollTarget: false,
            updateHistory: true,
            default_tab: 0, // index of tab to open on page load
            tab_class_panel: '.tabs-container__panel', // wrapper for each tab/accordion title and content
            tab_class_title: '.tabs-container__title', // title element for each tab/accordion
            tab_nav_id: 'TabNav' // ID to provide the constructed tab navigation
        };

        this.$container = $($container).addClass('tabs-init');

        this.settings = $.extend({}, defaults, options);

        if (this.settings.autoScrollTarget) {
            var candidateASTarget = $(this.settings.autoScrollTarget);
            this.autoScrollTarget = candidateASTarget.length
                ? candidateASTarget
                : $container;
        } else {
            this.autoScrollTarget = $container;
        }

        this.currentTab = null;
        this.isFirstTab = true;

        this.init();
    }

    /**
     * Init function - calls necessary set up and opens the first relevent tab
     */
    init() {
        var _this = this;
        var $startingTab;

        // Cache derived selectors
        this.$tab_panels = this.$container.find(this.settings.tab_class_panel);
        this.$accordion = this.$container
            .find('.tabs__accordion-wrapper')
            .attr('role', 'tablist');

        this.fetchTabData();
        this.bindAccordionEvents();
        this.bindHistoryAPIEvents();

        // if there's more than 1 tab, then a tab navigation is created on desktop
        if (this.$tab_panels.length > 1) {
            this.createTabNav();
            this.bindNavEvents();
        }

        $startingTab = this.getStartingTab();

        this.openTab($startingTab);

        // If there is a deep link in the url to a tab on load then scroll to the tabs just this once
        if (this.settings.autoScrollOnLoad && window.location.hash.length) {
            this.scrollToTabsTarget();
        }

        this.triggerCallback('onAfterInit');
    }

    /**
     * Creates a data object for all tabs within the widget
     * Saves each tab ID and title, to be used to create desktop tab nav if needed
     * Attaches Aria roles as it fetches tab data
     */
    fetchTabData() {
        const _this = this;

        // stores data for all tabs in the widget
        this.tabData = [];

        const $tab_panels = this.$tab_panels;

        let $currentPanel, $panelTitle, currentPanelData;

        // for each of the tabs, save its title and ID from the HTML
        $tab_panels.each(function() {
            $currentPanel = $(this);

            $panelTitle = $currentPanel.prev(_this.settings.tab_class_title);

            // Cache for use later on in this method
            currentPanelData = {
                tabId: $currentPanel.attr('id'),
                tabTitle: $panelTitle.text()
            };

            // Store tabData
            _this.tabData.push(currentPanelData);

            // update ARIA attrs for the panel and accordion title
            $currentPanel.attr({
                role: 'tabpanel',
                'aria-hidden': 'true'
            });

            $panelTitle.attr({
                tabindex: '-1',
                role: 'tab',
                'aria-controls': currentPanelData.tabId,
                'aria-selected': 'false',
                'aria-expanded': 'false'
            });
        });
    }

    /**
     * Builds HTML for the desktop tab navigation
     */
    createTabNav() {
        //console.log(count++);
        this.tabNav = true;

        let nav = this.tabData
            .map(function(data) {
                return `<li role='presentation' class='tabs__navigation__item'><a href='#${data.tabId}' id='TabController-${data.tabId}' class='txt-btn tabs__navigation__button' role='tab' aria-selected='false' aria-controls='${data.tabId}' tabindex=-1 aria-expanded='false'>${data.tabTitle}</a></li>`;
            })
            .join('');

        // Note the es6 tpl strings...
        this.$tabNav = $(
            `<div class="tabs__navigation-wrap"><ul class='tabs__navigation show-desktop' role='tablist'>${nav}</ul></div>`
        );

        var tabsBanner = $('.tabs__banner');

        this.$tabNav.appendTo(tabsBanner);

        // Cache the Nav Anchor items
        this.$tabNavItems = this.$tabNav.find('a');

        // add class to indicate that there's a navigation
        this.$container.addClass('tabs-nav-init');
    }

    /**
     * Binds the navigation events
     */
    bindNavEvents() {
        var _this = this;

        this.$tabNav.on('click', 'a', function(e) {
            e.preventDefault();

            var $target = $(e.currentTarget),
                $tabPanel = $(this.getAttribute('href'));

            if (!_this.isCurrentTab($tabPanel)) {
                _this.closeTab();
                _this.openTab($tabPanel);
            }
        });

        this.$tabNav.on('keydown', 'a', function(e) {
            var currentIndex = _this.handleKeyPress(e);
            if (currentIndex !== null) {
                _this.closeTab();
                var panelId = _this.tabData[currentIndex].tabId;
                _this.openTab($(document.getElementById(panelId)));
                _this.currentTab.$navItem.focus(); // focus only here so doesn't steal focus on page load
            }
        });
    }

    /**
     * helper to identify if the clicked tab is what's currently open
     * @param $tab_panel - jQuery collection of the tab to be evaluated
     */
    isCurrentTab($tab_panel) {
        return this.currentTab.$tab_panel.get(0) === $tab_panel.get(0);
    }

    /**
     * Key handler for tabs
     * @param e - event
    */
    handleKeyPress(e) {
        var keyCodes,
            currentIndex = this.currentTab.position;

        keyCodes = {
            DOWN: 40,
            ENTER: 13,
            ESCAPE: 27,
            HOME: 36,
            LEFT: 37,
            PAGE_DOWN: 34,
            PAGE_UP: 33,
            RIGHT: 39,
            SPACE: 32,
            TAB: 9,
            UP: 38
        };

        /* eslint-disable */
        switch (e.keyCode) {
            case keyCodes.LEFT:
            case keyCodes.UP:
                currentIndex--;
                if (currentIndex < 0) {
                    currentIndex = this.tabData.length - 1;
                }
                break;
            case keyCodes.END:
                currentIndex = this.tabData.length - 1;
                break;
            case keyCodes.HOME:
                currentIndex = 0;
                break;
            case keyCodes.SPACE:
            case keyCodes.ENTER:
                currentIndex = this.handleEnter(currentIndex);
                break;
            case keyCodes.RIGHT:
            case keyCodes.DOWN:
                currentIndex++;
                if (currentIndex >= this.tabData.length) {
                    currentIndex = 0;
                }
                break;
            default:
                currentIndex = null;
        }
        /* eslint-enable */

        return currentIndex;
    }

    handleEnter(currentIndex) {
        // enter will either select a new panel or do nothing if it's focused on an active panel
        // so we have to deal with the currently focused element rather than the selected tab
        var currentTabByFocusIndex = document.getElementById(
            document.activeElement.getAttribute('aria-controls')
        );

        if (currentTabByFocusIndex !== this.currentTab.$tab_panel.get(0)) {
            currentIndex = this.$tab_panels.index(currentTabByFocusIndex);
        }

        return currentIndex;
    }

    /**
     * Opens the tab
     * @param $tab_panel - jQuery collection of the tab that's being opened
     */
    openTab($tab_panel) {
        var _this = this;

        var options = this.settings;

        this.currentTab = {
            $tab_panel: $tab_panel.attr({
                'aria-hidden': 'false',
                tabindex: '0'
            }),
            $title: $tab_panel.prev(options.tab_class_title).attr({
                'aria-selected': true,
                'aria-expanded': true,
                tabindex: '0'
            }),
            //$navItem: $tab_panel.
            position: this.$tab_panels.index($tab_panel)
        };

        var currentTab = this.currentTab;

        // Added to allow time for weird reflow
        $tab_panel.addClass('tab--active');

        // Update Browser history and address bar
        if (
            !this.isFirstTab &&
            options.updateHistory &&
            this.supportsHistoryAPI()
        ) {
            this.updateHistory($tab_panel);
        }

        if (this.tabNav) {
            this.updateTabNav();
        }

        this.isFirstTab = false;

        this.triggerCallback('onTabOpen', {
            panel: $tab_panel
        });
    }

    /**
     * closes a tab if there's one open and a new one has been activated
     * Only one tab/accordion can be open at any given time
     */
    closeTab() {
        var currentTab = this.currentTab;

        currentTab.$tab_panel
            .attr({
                'aria-hidden': 'true'
            })
            .removeAttr('tabindex');

        // update accordion title values as well so everything is in synch
        currentTab.$title.attr({
            tabindex: '-1',
            'aria-selected': 'false',
            'aria-expanded': 'false'
        });

        if (this.tabNav) {
            currentTab.$navItem.attr({
                tabindex: '-1',
                'aria-selected': 'false',
                'aria-expanded': 'false'
            });
        }

        //console.log(currentTab.$navItem.parent());

        currentTab.$navItem
            .parent()
            .toggleClass('tabs__navigation__item--active');
        currentTab.$tab_panel.removeClass('tab--active');

        this.currentTab = null;
    }

    scrollToTabsTarget() {
        var _this = this;

        if (_this.autoScrollTarget.length) {
            //zenscroll.to($(_this.autoScrollTarget));

            this.triggerCallback('scrollToTab', {
                panel: _this
            });
        }
    }

    updateHistory($tab_panel) {
        var tabId = $tab_panel.attr('id');
        var currHref = window.location.origin + window.location.pathname;
        var historyState = currHref + '#' + tabId;
        history.pushState(null, null, historyState);
    }

    supportsHistoryAPI() {
        return !!(window.history && history.pushState);
    }

    /**
     * Updates the dynamically created tab nav in desktop once a new tab has been opened
     * @param $tab - jQuery element for the tab that was just opened
     */
    updateTabNav() {
        var currentTab = this.currentTab;

        currentTab.$navItem = this.$tabNavItems.eq(currentTab.position);

        currentTab.$navItem.attr({
            tabindex: '0',
            'aria-selected': 'true',
            'aria-expanded': 'true'
        });

        currentTab.$navItem
            .parent()
            .toggleClass('tabs__navigation__item--active');
    }

    /**
     * Binds any events specific to Accordion functionality (tablet and mobile only)
     * ARIA initially didn't work here because:
      * there's no tablist role on any container
      * the tab panels are controlled by the nav and not the headers
     */
    bindAccordionEvents() {
        var app = this;

        this.$accordion.on('keydown', this.settings.tab_class_title, function(
            e
        ) {
            var currentIndex = app.handleKeyPress(e);

            if (currentIndex !== null) {
                app.handleAccordion(app.$tab_panels.eq(currentIndex));
            }
        });

        //https://bugs.webkit.org/show_bug.cgi?id=133613
        this.$accordion.find('.tabs-container__title').on('click', function(e) {
            e.preventDefault();
            app.handleAccordion(
                $(e.currentTarget).next(app.options.tab_class_panel)
            );
        });
    }

    handleAccordion($tab_panel) {
        if (!this.isCurrentTab($tab_panel)) {
            this.openAccordion($tab_panel);
        }
    }

    /**
     * Helper to open an accordion.
     * Just calls openTab() and adds animation to scroll viewer to active accordion panel
     * @param $tab_panel - jQuery element of the tabpnael being opened
     */
    openAccordion($tab_panel) {
        this.closeTab();
        this.openTab($tab_panel);
        this.currentTab.$title.focus();
    }

    findPanelFromLocationHash() {
        var locHash = window.location.hash;
        var $candidateTab = false;

        if (locHash !== undefined && locHash.length) {
            $candidateTab = this.$container.find(locHash); // locHash already contains the "#" ID selector

            if ($candidateTab.length) {
                return $candidateTab;
            }
        }

        return false;
    }

    getStartingTab() {
        var $startingTab = this.$tab_panels.eq(this.settings.default_tab);
        var locHash = window.location.hash;
        var $candidateTab = false;

        if (locHash !== undefined && locHash.length) {
            $candidateTab = this.$container.find(locHash); // locHash already contains the "#" ID selector

            if ($candidateTab.length) {
                $startingTab = $candidateTab;
            }
        }

        return $startingTab;
    }

    bindHistoryAPIEvents(eventName) {
        var _this = this;

        if (!this.supportsHistoryAPI() || !this.settings.autoScrollOnPopState) {
            return;
        }

        $(window).on('popstate', function(e) {
            var $tabPanel = _this.findPanelFromLocationHash();

            if ($tabPanel) {
                _this.closeTab();
                _this.openTab($tabPanel);
                _this.scrollToTabsTarget();
            }
        });
    }
}

// Apply Mixins
applyMixins(Tabs, triggerCallback);

// Export
export default Tabs;
