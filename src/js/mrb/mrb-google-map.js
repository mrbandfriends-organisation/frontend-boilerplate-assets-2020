/* eslint-disable */
/**
 * MAPS BUILDER
 *
 * Google Maps Constructor used to Build Google map /
 * Set center Point / Place Point of Interest Markers
 * / Create info windows
 *
 */


import googleMapsAPILoader from 'lib/google-map-promise-loader';

googleMapsAPILoader.key = LOCALISED_VARS.googlemapsapikey;

var iconPath = LOCALISED_VARS.stylesheet_directory_uri + '/assets/dist/svg/standalone/arrows/png/';

var icons = {
    halls : {
        icon: iconPath + 'map-marker-green.png'
    },
    university: {
        icon: iconPath + 'map-marker-green.png'
    },
    transportlink: {
        icon: iconPath + 'map-marker-red.png'
    },
    supermarket: {
        icon: iconPath + 'map-marker-black.png'
    },
    restaurantbar: {
        icon: iconPath + 'map-marker-dark-green.png'
    },
    shopping: {
        icon: iconPath + 'map-marker-black.png'
    }
};

/**
 * CONSTRUCTOR
 * initialises the object
 */

class MapsLoader {
    constructor(el, options) {
        this.el = el;

        // Options
        this.settings = Object.assign({
            googleMapElement: document.querySelectorAll('.js-google-map'),
            loadedClass: 'is-loaded',
            centerPoint: JSON.parse(this.el.getAttribute( 'data-center' )),
            zoom: JSON.parse(this.el.getAttribute( 'data-zoom' )),
            markersArray: JSON.parse(this.el.getAttribute( 'data-markers' )),
            mapInstance: null,
            mapOptions: null
        }, options);

        this.initMaps();
    }

    initMaps() {

        this.settings.googleMapElement.forEach(el => {

            // If map is already loaded or has not yet entered the viewport, do nothing
            if(el.classList.contains(this.settings.loadedClass) || !el.classList.contains('is-inview')) {
                return;
            }

            googleMapsAPILoader.load().then( (GMaps) => { // maps is equal to google.maps

                // Set map options
                this.configureMapOptions();

                this.settings.mapInstance = new GMaps.Map(el, this.settings.mapOptions);

                this.applyMarker(this.settings.centerPoint);

                if(this.settings.markersArray) {
                    this.applyMarkers(this.settings.markersArray);
                }
            });

            el.classList.add(this.settings.loadedClass);

        });
    }

    applyMarker(centerMarker) {
        var marker = new google.maps.Marker({
            position: {lat: parseFloat(centerMarker['marker']['lat']) , lng: parseFloat(centerMarker['marker']['lng'])},
            map: this.settings.mapInstance,
            title: centerMarker['marker']['address'],
            icon: icons['transportlink']['icon']
        });

        this.createInfoWindow(marker, centerMarker);
    }

    applyMarkers(markers) {
        markers.forEach(el => {
            var marker = new google.maps.Marker({
                position: {lat: parseFloat(el['marker']['lat']), lng: parseFloat(el['marker']['lng'])},
                map: this.settings.mapInstance,
                title: el['marker']['address'],
                icon: icons[el.type.toLowerCase()] ? icons[el.type.toLowerCase()].icon : icons['university']['icon']
            });

            this.createInfoWindow(marker, el);
        });
    }

    createInfoWindow(marker, el) {

        let addressHref;
        let linkContent;
        let infoWindow;
        let openInNewAttrs = '';

        let title = el['label'];
        let address = el['marker']['address'];

        // 2. Converts address to string with only +'s not spaces'
        if( address ) {
            addressHref = address.split(' ').join('+');
        }

        openInNewAttrs = ' target="_blank" rel="noopener noreferrer" ';

        linkContent = `<a ${openInNewAttrs}class="map-info-window__link" href="https://maps.google.com/?q=${addressHref}">Get directions</a>`;

        infoWindow = new google.maps.InfoWindow();
        google.maps.event.addListener(marker, 'click', function() {
            InfoWindow.setContent(
                `<strong class="map-info-window">${title}</strong><br />${linkContent}`
            );
            InfoWindow.open(map, this);
        });
    }

    configureMapOptions() {
        // Set map options
        this.settings.mapOptions = {
            center: {lat: parseFloat(this.settings.centerPoint['marker']['lat']) , lng: parseFloat(this.settings.centerPoint['marker']['lng']) },
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            zoom: parseFloat(this.settings.centerPoint['zoom'])
        };
    }
}

// Export
export default MapsLoader;
