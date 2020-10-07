import inView from 'in-view';
import MapsLoader from 'mrb/mrb-google-map';
import googleMapsAPILoader from 'lib/google-map-promise-loader';

const googleMapSelector = '.js-google-map';

// Set threshold of when google map appears
inView.threshold(0);

inView(googleMapSelector)
    .on('enter', function(el) {
        el.classList.add('is-inview');

        new MapsLoader(el);
    });



