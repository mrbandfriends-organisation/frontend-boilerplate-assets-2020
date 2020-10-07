/**
 *  ACCORDION
 *
 * A lightwight vanilla JS accordion with an exstensible API
 */

import 'uuid';
const uuidV4 = require('uuid/v4');

/**
 * CONSTRUCTOR
 * initialises the object
 */
class MrbAccordion {
    constructor(el, options) {
        const container = document.querySelector(el);

        // If el is not defined
        if (container == null) {
            return;
        }

        const defaults = {
            header: '.js-accordion-header',
            panel: '.js-accordion-panel',
            panelInner: '.js-accordion-panel-inner',
            activeClass: 'is-active',
            hidenClass: 'is-hidden',
            initalisedClass: 'mrb-accordion--initalised',
            headerDataAttr: 'data-mrb-accordion-header-id',
            openAllPanels: false,
            openHeadersOnLoad: []
            // toggleEl:            // If you want to use a different element to trigger the accordion
        };

        // Options
        this.settings = Object.assign({}, defaults, options);

        // Setting getting elements
        this.container = container;
        this.headers = Array.from(
            this.container.querySelectorAll(this.settings.header)
        );
        this.panels = Array.from(
            this.container.querySelectorAll(this.settings.panel)
        );
        this.toggleEl = this.settings.toggleEl !== undefined
            ? Array.from(
                  this.container.querySelectorAll(this.settings.toggleEl)
              )
            : this.headers;

        // This is for managing state of the accordion. It by default sets
        // all accordion panels to be closed
        this.states = [].map.call(this.headers, header => {
            return { state: 'closed' };
        });

        this.ids = [].map.call(this.headers, header => {
            return { id: uuidV4() };
        });

        // This is to ensure that once an opne/close event has been fired
        // another cannot start until the first event has finished.
        // @TODO - get this working...
        this.toggling = false;

        // Initiating the accordion
        if (this.container) {
            this.init();
        }
    }

    /**
     *  INSERT DATA ATTRS
     *
     *  Updates state object for the inital loading of the accordion
     */
    init() {
        // Sets up ID, aria attrs & data-attrs
        this.setupAttributes();

        // Setting up the inital view of the accordion
        this.initalState();

        // Setting the height of each panel
        this.setPanelHeight();

        // Inserting data-attribute onto each `header`
        this.insertDataAttrs();

        // Adding listeners to headers
        this.addListeners();

        //
        this.finishInitalisation();
    }

    /**
     *  INSERT DATA ATTRS
     *
     *  Updates state object for inital loading of the accordion
     */
    initalState() {
        // Sets state object as per `this.settings.openHeadersOnLoad`
        const headersToOpen = this.settings.openHeadersOnLoad;

        if (headersToOpen.length) {
            this.openHeaders(headersToOpen);
        }

        // Render DOM as per the updates `this.states` object
        this.renderDom();
    }

    /**
     *  INSERT DATA ATTRS
     *
     *  Adds `headerDataAttr` to all headers
     */
    insertDataAttrs() {
        this.headers.forEach((header, index) => {
            header.setAttribute(this.settings.headerDataAttr, index);
        });
    }

    /**
     *  FINISH INITALISATION
     *
     *  Adds in `initalisedClass` to accordion
     */
    finishInitalisation() {
        this.container.classList.add(this.settings.initalisedClass);
    }

    /**
     *  ADD LISTENERS
     *
     *  Adds click event to each header
     *  @TODO - ideally would have proper event delegation rather than adding listener to each header
     */
    addListeners() {
        // So we can reference the mrb-accordion object inside out eventListener
        const _this = this;

        // Adding click event to accordion
        this.headers.forEach((header, index) => {
            header.addEventListener('click', function(event) {
                // Getting the target of the click
                // const clickedEl = event.target;

                _this.handleClick(header, index);
            });
        });
    }

    /**
     *  HANDLE CLICK
     *
     *  //TODO - Add comment
     *  @param {object} targetHeader - The header node you want to open
     */
    handleClick(targetHeader, headerIndex) {
        // Removing current `.` from `this.settings.header` class so it can
        // be checked against the `targetHeader` classList
        const targetHeaderClass = this.settings.header.substr(1);

        // Checking that the thing that was clicked on was the accordions header
        if (targetHeader.classList.contains(targetHeaderClass)) {
            // Updating states
            this.setState(headerIndex);

            // Render DOM as per the updates `this.states` object
            this.renderDom();
        }
    }

    /**
     *  SET STATES
     *
     *  Sets the state for all headers. The 'target header' will have its state toggeled
     *  @param {object} targetHeaderId - The header node you want to open
     */
    setState(targetHeaderId) {
        const states = this.getState();

        // TODO - improve this comment
        // If `this.settings.openAllPanels` is false we need to ensure only one panel
        // be can open at once. This will the state on all but the target header to 'closed'
        if (!this.settings.openAllPanels) {
            states.filter((state, index) => {
                if (index != targetHeaderId) {
                    state.state = 'closed';
                }
            });
        }

        // Toggles the state value of the target header. This was `array.find` but `find`
        // isnt supported in IE11
        states.filter((state, index) => {
            if (index == targetHeaderId) {
                // TODO - is this a `const` or `let`?
                const newState = this.toggleState(state.state);
                return (state.state = newState);
            }
        });
    }

    /**
     *  RENDER DOM
     *
     *  Renders the accordion in the DOM using the `this.states` object
     */
    renderDom() {
        const states = this.getState();

        // Filter through all open headers and open them
        this.states.filter((state, index) => {
            if (state.state === 'open') {
                const header = this.headers[index];

                this.open(header);
            }
        });

        // Filter through all closed headers and closes them
        this.states.filter((state, index) => {
            if (state.state === 'closed') {
                const header = this.headers[index];

                this.close(header);
            }
        });

        // Resetting toggling so a new event can be fired
        this.toggling = false;
    }

    /**
     *  OPEN
     *
     *  Closes a specific panel
     *  @param {object} header - The header node you want to open
     */
    open(header, headerId) {
        this.togglePanel('open', header);
    }

    /**
     *  CLOSE
     *
     *  Closes a specific panel
     *  @param {object} header - The header node you want to close
     */
    close(header) {
        this.togglePanel('closed', header);
    }

    /**
     *  OPEN ALL
     *
     *  Opens all panels
     */
    openAll() {
        this.headers.forEach(header => {
            this.togglePanel('open', header);
        });
    }

    /**
     *  CLOSE ALL
     *
     *  Closes all panels
     */
    closeAll() {
        this.headers.forEach(header => {
            this.togglePanel('closed', header);
        });
    }

    /**
     *  GET STATE
     *
     *  Getting state of headers. By default gets state of all headers
     *  @param {string} animationAction - The animation you want to invoke
     *  @param {object} header          - The header node you want to animate
     */
    togglePanel(animationAction, header) {
        if (animationAction && header) {
            if (animationAction === 'closed') {
                // Getting ID of panel that we want to close
                let panelId = header.getAttribute('aria-controls'),
                    panelToClose = this.container.querySelector(`#${panelId}`);

                // Closeing panel
                panelToClose.classList.add(this.settings.hidenClass);

                // Set aria attrs
                header.setAttribute('aria-expanded', false);
            } else if (animationAction === 'open') {
                // 1.
                // Getting ID of panel that we want to open
                let panelId = header.getAttribute('aria-controls'),
                    panelToOpen = this.container.querySelector(`#${panelId}`);

                // Opening panel
                panelToOpen.classList.remove(this.settings.hidenClass);

                // Set aria attrs
                header.setAttribute('aria-expanded', true);
            }
        }
    }

    // @TODO - is this needed anymore?
    checkState(headerId) {
        let state = this.states[headerId].state;

        if (state === 'closed') {
            return state;
        } else if (state === 'open') {
            return state;
        }
    }

    /**
     *  GET STATE
     *
     *  Getting state of headers. By default gets state of all headers
     *  @param {array} headerIds - Id/'s of the headers you want to check
     */
    getState(headerIds = []) {
        if (headerIds.length && Array.isArray(headerIds)) {
            let states = headerIds.map(header => this.states[header]);

            return states;
        } else {
            return this.states;
        }
    }

    /**
     *  TOGGLE STATE
     *
     *  Toggling the state value
     *  @param {string} currentState - Current state value for a header
     */
    toggleState(currentState) {
        if (currentState !== undefined) {
            return currentState === 'closed' ? 'open' : 'closed';
        }
    }

    /**
     *  GET HEADER ID
     *
     *  Getting an ID for a header
     *  @param {array} header - Array of ID's for the headers to be open
     */
    getHeaderId(header) {
        if (header !== undefined) {
            return header.getAttribute(this.settings.headerDataAttr);
        }
    }

    /**
     *  HEADERS TO OPEN
     *
     *  Setting which headers should be open when accordion is initalised
     *  @param {array} headersToOpen - Array of ID's for the headers to be open
     */
    openHeaders(headersToOpen = []) {
        if (headersToOpen.length && Array.isArray(headersToOpen)) {
            let headers = headersToOpen.filter(header => header != undefined);

            headersToOpen.forEach(header => {
                return (this.states[header].state = 'open');
            });
        }
    }

    /**
     *  SET PANEL HEIGHT
     *
     *  Setting height for panels using pannels inner element
     */
    setPanelHeight() {
        // [].forEach.(this.panels, (panel) => {
        this.panels.forEach(panel => {
            const panelInner = panel.querySelector(this.settings.panelInner);

            let activeHeight = panelInner.offsetHeight;

            return (panel.style.maxHeight = `${activeHeight}px`);
        });
    }

    /**
     *  SET UP HEADERS
     *
     *  Adding `ID` & `aria-controls` attibutes to headers
     */
    setupHeaders() {
        this.headers.forEach((header, index) => {
            header.setAttribute(
                'id',
                `mrb-accordion-header-${this.ids[index].id}`
            );
            header.setAttribute(
                'aria-controls',
                `mrb-accordion-panel-${this.ids[index].id}`
            );
        });
    }

    /**
     *  SET UP PANELS
     *
     *  Adding `ID` & `aria-labeledby` attibutes to panels
     */
    setupPanels() {
        this.panels.forEach((panel, index) => {
            panel.setAttribute(
                'id',
                `mrb-accordion-panel-${this.ids[index].id}`
            );
            panel.setAttribute(
                'aria-labeledby',
                `mrb-accordion-header-${this.ids[index].id}`
            );
        });
    }

    /**
     *  SET UP ATTRIBUTES
     *
     *  Adding attibutes to headers & panels
     */
    setupAttributes() {
        // Adding ID & aria-controls
        this.setupHeaders();

        // Adding ID & aria-labeledby
        this.setupPanels();

        // Inserting data-attribute onto each `header`
        this.insertDataAttrs();
    }
}

// Apply Mixins
// applyMixins(VideoPlayer, triggerCallback);

// Export
export default MrbAccordion;
