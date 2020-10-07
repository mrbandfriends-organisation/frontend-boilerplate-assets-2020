import $ from 'jquery';
import 'slick-carousel';

$('.js-carousel').slick({
    mobileFirst: true,
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    dots: true,

    responsive: [
        {
            breakpoint: 768,
            settings: {
                draggable: false
            }
        }
    ]
});
