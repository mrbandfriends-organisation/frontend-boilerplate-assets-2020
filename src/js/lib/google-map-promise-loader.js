/* eslint-disable */
const googleMapsAPILoader = {

    key: '',

    isLoaded: false,

    loadInProgress: false,

    resolveFunc: false,

    resolverPromise: false,

    loadGMaps() {
        if (this.loadInProgress) {
            return; // bale out!
        }

        this.loadInProgress = true;

        var script = document.createElement('script');
        script.src = 'https://maps.googleapis.com/maps/api/js?key=' + this.key + '&callback=__MRB_GOOGLE_MAPS_LOAD_CALLBACK__';
        document.body.appendChild(script);
    },


    // don't call directly...
    // called by the Google Maps callback when it has loaded
    // at which point we tell the module that Google Maps has loaded
    // and call the resolveFunc with is actually a reference to the resolve
    // value of the Promise we created in load() which then resolves
    _handleLoaded() {


        if(this.resolveFunc) {
            this.loadInProgress = false;
            this.isLoaded = true;
            this.resolveFunc(window.google.maps);
        }
    },

    resolver() {
        if (this.resolverPromise) {
            return this.resolverPromise;
        }

        this.resolverPromise = new Promise( (resolve, reject) => {
            this.resolveFunc = resolve; // here we set the resolveFunc to refer to the resolve value of the Promise


        });

        return this.resolverPromise;
    },

    load() {

        // If already loaded maps API then resolve immediately with the google.maps object
        if(this.isLoaded) {
            return Promise.resolve(google.maps);
        }

        // If not then kick off loading of maps API via script then
        // continue on and immediately return a Promise
        this.loadGMaps();

        // This promise is returned to the consumer and will resolve when
        // the Google Maps callback returns in the script tag
        return this.resolver();
    },

};

// We have to expose this to Google Maps on the global scope
// note we .bind() here otherwise "this" inside the _handleLoaded would refer to the window (or undefined!)
window.__MRB_GOOGLE_MAPS_LOAD_CALLBACK__ = googleMapsAPILoader._handleLoaded.bind(googleMapsAPILoader);

export default googleMapsAPILoader;
