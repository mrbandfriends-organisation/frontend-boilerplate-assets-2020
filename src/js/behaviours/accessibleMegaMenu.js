'use strict';

// Async load
require.ensure(
    ['lib/accessibleMegaMenu'],
    function() {
        require('lib/accessibleMegaMenu');

        setTimeout(function() {
            $('.js-accessible-mega-menu').accessibleMegaMenu({
                menuClass: 'menu-primary__list',
                topNavItemClass: 'menu-primary__item',
                panelClass: 'menu-primary__dropdown',
                panelGroupClass: 'menu-primary__sub-menu__item'
            });
        }, 500);
    },
    'accessible-mega-menu'
);
