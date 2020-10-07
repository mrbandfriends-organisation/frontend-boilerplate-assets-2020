'use strict';
/**
 * InView Checker
 * https://camwiegert.github.io/in-view/
 */

import inView from 'in-view';

inView.threshold(0.65);

inView('.js-inview')
    .on('enter', function(el) {
        el.classList.add('is-inview');
    })
    .on('exit', el => {
        //el.classList.remove('is-inview');
    });
