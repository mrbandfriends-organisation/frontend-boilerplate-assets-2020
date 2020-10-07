// jshint strict:false
/**
 * WEBFONT MANAGMENT
 *
 * utilise fontfaceobserver as per best practice
 * https://www.zachleat.com/web/comprehensive-webfonts/
 *
 * Essentially, we load the critical fontfirst and then progressively load in other less critical
 * weights after the first load has completed. Note that until the @fontface is actually used in
 * the CSS then it will not be "loaded". As a result if we conditionally apply the fontface using
 * the classes added to the <html> element then we can control when the fonts are requested via
 * JavaScript rather than allowing browser to handle. This provides full control over FOUT/FOIT!
 *
 * Also note we have a optimisation for repeat loads which is in `head.php`. For more info see
 * https://www.zachleat.com/web-fonts/demos/fout-with-class.html
 */

import FontFaceObserver from 'fontfaceobserver';

// Set this to true when using webfonts
const WEB_FONTS = false;

function webfonts() {
    // 1. Timeout helper
    function timer(time) {
        return new Promise(function(resolve, reject) {
            setTimeout(reject, time);
        });
    }

    let timeout = WEB_FONTS ? 3000 : 1;

    // 2. Setup FontFaceObservers and pass in your fonts family name
    //    rather than the font files name. This can be anything you want. If
    //    you are loading 2 weight for the same font you *MUST* ensure that
    //    both font familes have very different names. Eg;

    //    LatoRegular = Lato 400
    //    LatoBold    = Lato 700
    let webFont = new FontFaceObserver('ExampleFont');

    // 3. Race the Font load against the timeout
    Promise.race([
        timer(timeout), // if the fonts aint loaded fast enough then kick off big time!
        webFont.load()
    ])
        .then(function() {
            if (!document.documentElement.classList.contains('wf-active-1')) {
                // don't re-added if optimised loading has already added
                document.documentElement.className += ' wf-active-1';
            }

            sessionStorage.foutFontsLoaded = true;

            /**
             *  SECONDARY FONTS
             *
             *  If you have more than one font then create a new instance of the
             *  `FontFaceObserver` per font. You can pass in CSS font properties
             *  when you call `FontFaceObserver`.
             */

            // let secondaryFont = new FontFaceObserver('ExampleFontBold', {});

            // let tertiaryFont = new FontFaceObserver('ExampleFontLight', {});

            // Promise.all([secondaryFont.load(), tertiaryFont.load()]).then(function () {
            //     document.documentElement.className += " wf-active-2";

            //     // Optimization for Repeat Views
            //     sessionStorage.foutFontsLoaded2 = true;
            // });

            // Optimise for repeat view - https://www.zachleat.com/web-fonts/demos/fout-with-class.html
        })
        .catch(function() {
            document.documentElement.className += ' wf-inactive';
        });
}

export default webfonts;
