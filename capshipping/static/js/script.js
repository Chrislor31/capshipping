


var DREAMIT = {};
(function ($) {

	"use strict";



	//Loading Preloader
	function handlePreloader() {
		if ($('.preloader').length) {
			$('.preloader').delay(200).fadeOut(500);
		}
	}

	//Update Header Style and Scroll to Top
	function headerStyle() {
		if ($('.main-header').length) {
			var windowpos = $(window).scrollTop();
			var siteHeader = $('.header-style-one');
			var scrollLink = $('.scroll-to-top');
			var sticky_header = $('.main-header .sticky-header');
			if (windowpos > 100) {
				sticky_header.addClass("fixed-header animated slideInDown");
				scrollLink.fadeIn(300);
			} else {
				sticky_header.removeClass("fixed-header animated slideInDown");
				scrollLink.fadeOut(300);
			}
			if (windowpos > 1) {
				siteHeader.addClass("fixed-header");
			} else {
				siteHeader.removeClass("fixed-header");
			}
		}
	}
	headerStyle();

	let win = $(window);
	let sticky_id = $(".header-area");
	win.on('scroll', function () {
		let scroll = win.scrollTop();
		if (scroll < 245) {
			sticky_id.removeClass("sticky-header");
		} else {
			sticky_id.addClass("sticky-header");
		}
	});
	// 

	//Submenu Dropdown Toggle
	if ($('.main-header li.dropdown ul').length) {
		$('.main-header .navigation li.dropdown').append('<div class="dropdown-btn"><i class="fa fa-angle-down"></i></div>');
	}

	//Mobile Nav Hide Show
	if ($('.mobile-menu').length) {

		var mobileMenuContent = $('.main-header .main-menu .navigation').html();

		$('.mobile-menu .navigation').append(mobileMenuContent);
		$('.sticky-header .navigation').append(mobileMenuContent);

		// Close Button
		$(document).on('click', '.mobile-menu .close-btn', function () {
			$('body').removeClass('mobile-menu-visible');
		});

		// Dropdown Button (Delegated)
		$(document).on('click', '.mobile-menu li.dropdown .dropdown-btn', function () {
			$(this).prev('ul').slideToggle(500);
			$(this).toggleClass('active');
		});

		// Menu Toggle Btn
		$(document).on('click', '.mobile-nav-toggler', function () {
			$('body').addClass('mobile-menu-visible');
		});

		// Backdrop + Close
		$(document).on('click', '.mobile-menu .menu-backdrop, .mobile-menu .close-btn', function () {
			$('body').removeClass('mobile-menu-visible');
		});
	}


	//Header Search js
	if ($('.search-box-outer').length) {

		$(document).on('click', '.search-box-outer', function () {
			$('body').addClass('search-active');
		});

		$(document).on('click', '.close-search', function () {
			$('body').removeClass('search-active');
		});
	}

	//educate all button
	$(function () {
		$('.loginet-button')
			.on('mouseenter', function (e) {
				var parentOffset = $(this).offset(),
					relX = e.pageX - parentOffset.left,
					relY = e.pageY - parentOffset.top;
				$(this).find('span').css({ top: relY, left: relX })
			})
			.on('mouseout', function (e) {
				var parentOffset = $(this).offset(),
					relX = e.pageX - parentOffset.left,
					relY = e.pageY - parentOffset.top;
				$(this).find('span').css({ top: relY, left: relX })
			});
	});

	$(function () {
		$('.button')
			.on('mouseenter', function (e) {
				var parentOffset = $(this).offset(),
					relX = e.pageX - parentOffset.left,
					relY = e.pageY - parentOffset.top;
				$(this).find('span').css({ top: relY, left: relX })
			})
			.on('mouseout', function (e) {
				var parentOffset = $(this).offset(),
					relX = e.pageX - parentOffset.left,
					relY = e.pageY - parentOffset.top;
				$(this).find('span').css({ top: relY, left: relX })
			});
	});

	// counterUp
	$('.counter').counterUp({
		delay: 10,
		time: 1000
	});

	//Accordion Box
	if ($('.accordion-box').length) {
		$(".accordion-box").on('click', '.acc-btn', function () {

			var outerBox = $(this).parents('.accordion-box');
			var target = $(this).parents('.accordion');

			if ($(this).hasClass('active') !== true) {
				$(outerBox).find('.accordion .acc-btn').removeClass('active ');
			}

			if ($(this).next('.acc-content').is(':visible')) {
				return false;
			} else {
				$(this).addClass('active');
				$(outerBox).children('.accordion').removeClass('active-block');
				$(outerBox).find('.accordion').children('.acc-content').slideUp(300);
				target.addClass('active-block');
				$(this).next('.acc-content').slideDown(300);
			}
		});
	}

	//Jquery Knob animation  // Pie Chart Animation
	if ($('.dial').length) {
		$('.dial').appear(function () {
			var elm = $(this);
			var color = elm.attr('data-fgColor');
			var perc = elm.attr('value');

			elm.knob({
				'value': 0,
				'min': 0,
				'max': 100,
				'skin': 'tron',
				'readOnly': true,
				'thickness': 0.07,
				'dynamicDraw': true,
				'displayInput': false
			});

			$({ value: 0 }).animate({ value: perc }, {
				duration: 2000,
				easing: 'swing',
				progress: function () {
					elm.val(Math.ceil(this.value)).trigger('change');
				}
			});

			//circular progress bar color
			$(this).append(function () {
				// elm.parent().parent().find('.circular-bar-content').css('color',color);
				//elm.parent().parent().find('.circular-bar-content .txt').text(perc);
			});

		}, { accY: 20 });
	}


	//Tabs Box
	if ($('.tabs-box').length) {
		$('.tabs-box .tab-buttons .tab-btn').on('click', function (e) {
			e.preventDefault();
			var target = $($(this).attr('data-tab'));

			if ($(target).is(':visible')) {
				return false;
			} else {
				target.parents('.tabs-box').find('.tab-buttons').find('.tab-btn').removeClass('active-btn');
				$(this).addClass('active-btn');
				target.parents('.tabs-box').find('.tabs-content').find('.tab').fadeOut(0);
				target.parents('.tabs-box').find('.tabs-content').find('.tab').removeClass('active-tab animated fadeIn');
				$(target).fadeIn(300);
				$(target).addClass('active-tab animated fadeIn');
			}
		});
	}

	//Progress Bar
	if ($('.progress-line').length) {
		$('.progress-line').appear(function () {
			var el = $(this);
			var percent = el.data('width');
			$(el).css('width', percent + '%');
		}, { accY: 0 });
	}

	//LightBox / Fancybox
	if ($('.lightbox-image').length) {
		$('.lightbox-image').fancybox({
			openEffect: 'fade',
			closeEffect: 'fade',
			helpers: {
				media: {}
			}
		});
	}

	// Scroll to a Specific Div
	if ($('.scroll-to-target').length) {
		$(".scroll-to-target").on('click', function () {
			var target = $(this).attr('data-target');
			// animate
			$('html, body').animate({
				scrollTop: $(target).offset().top
			}, 0);

		});
	}

	// Elements Animation
	if ($('.wow').length) {
		var wow = new WOW(
			{
				boxClass: 'wow',      // animated element css class (default is wow)
				animateClass: 'animated', // animation css class (default is animated)
				offset: 0,          // distance to the element when triggering the animation (default is 0)
				mobile: false,       // trigger animations on mobile devices (default is true)
				live: true       // act on asynchronously loaded content (default is true)
			}
		);
		wow.init();
	}

	// count Bar
	if ($(".count-bar").length) {
		$(".count-bar").appear(
			function () {
				var el = $(this);
				var percent = el.data("percent");
				$(el).css("width", percent).addClass("counted");
			}, {
			accY: -50
		}
		);
	}

	//Gallery Filters
	if ($('.filter-list').length) {
		$('.filter-list').mixItUp({});
	}


	/* ------------------------------- */
	/*  one page nav*/
	/* ------------------------------- */
	var $onepage_nav = $('.onepage-nav');
	var $sections = $('section');
	var $window = $(window);
	function TM_activateMenuItemOnReach() {
		if ($onepage_nav.length > 0) {
			var cur_pos = $window.scrollTop() + 2;
			var nav_height = $onepage_nav.outerHeight();
			$sections.each(function () {
				var top = $(this).offset().top - nav_height - 80,
					bottom = top + $(this).outerHeight();

				if (cur_pos >= top && cur_pos <= bottom) {
					$onepage_nav.find('a').parent().removeClass('current').removeClass('active');
					$sections.removeClass('current').removeClass('active');
					$onepage_nav.find('a[href="#' + $(this).attr('id') + '"]').parent().addClass('current').addClass('active');
				}

				if (cur_pos <= nav_height && cur_pos >= 0) {
					$onepage_nav.find('a').parent().removeClass('current').removeClass('active');
					$onepage_nav.find('a[href="#header"]').parent().addClass('current').addClass('active');
				}
			});
		}
	}

	/* =================================
		Scrollig
	   ================================ */

	$(window).on('scroll', function () {
		headerStyle();
		TM_activateMenuItemOnReach();
	});

	/* ==============================
	   loading
	   ============================== */

	$(window).on('load', function () {
		handlePreloader();
	});


	//===== Nice select js
	if ($('select').length) {
		$('select').niceSelect();
	}

	//======< Custom Tab >======
	$('.tab ul.tabs').addClass('active').find('> li:eq(0)').addClass('current');

	$(document).on("click", ".tab ul.tabs li a", function (g){
		var tab = $(this).closest('.tab'),
			index = $(this).closest('li').index();

		tab.find('ul.tabs > li').removeClass('current');
		$(this).closest('li').addClass('current');

		tab.find('.tab_content').find('div.tabs_item').not('div.tabs_item:eq(' + index + ')').slideUp();
		tab.find('.tab_content').find('div.tabs_item:eq(' + index + ')').slideDown();

		g.preventDefault();
	});

	//Jquery Knob animation  // Pie Chart Animation
	if ($('.dial').length) {
		$('.dial').appear(function () {
			var elm = $(this);
			var color = elm.attr('data-fgColor');
			var perc = elm.attr('value');

			elm.knob({
				'value': 0,
				'min': 0,
				'max': 100,
				'skin': 'tron',
				'readOnly': true,
				'thickness': 0.5,
				'dynamicDraw': true,
				'displayInput': false
			});

			$({ value: 0 }).animate({ value: perc }, {
				duration: 2000,
				easing: 'swing',
				progress: function () {
					elm.val(Math.ceil(this.value)).trigger('change');
				}
			});

			//circular progress bar color
			$(this).append(function () {
				elm.parent().parent().find('.circular-bar-content').css('color', color);
				elm.parent().parent().find('.circular-bar-content .txt').text(perc);
			});

		}, { accY: 20 });
	}
	//Text Count
	if ($('.count-box').length) {
		$('.count-box').appear(function () {
			var $t = $(this),
				n = $t.find(".count-text").attr("data-stop"),
				r = parseInt($t.find(".count-text").attr("data-speed"), 10);

			if (!$t.hasClass("counted")) {
				$t.addClass("counted");
				$({
					countNum: $t.find(".count-text").text()
				}).animate({
					countNum: n
				}, {
					duration: r,
					easing: "linear",
					step: function () {
						$t.find(".count-text").text(Math.floor(this.countNum));
					},
					complete: function () {
						$t.find(".count-text").text(this.countNum);
					}
				});
			}

		}, { accY: 0 });
	}

	/* Popup Video */
	if ($('.popup-video').length) {
		$('.popup-video').magnificPopup({
			type: 'iframe',
			mainClass: 'mfp-fade',
			removalDelay: 160,
			preloader: false,
			fixedContentPos: true
		});
	}

	// main-home band-active js
	var slider = new Swiper(".band-active", {
		speed: 1500,
		slidesPerView: 4,
		spaceBetween: 30,
		loop: true,
		autoplay: true,
		breakpoints: {
			1920: {
				slidesPerView: 5,
			},
			1400: {
				slidesPerView: 5,
			},
			1200: {
				slidesPerView: 4,
			},
			992: {
				slidesPerView: 3,
			},
			768: {
				slidesPerView: 3,
			},
			576: {
				slidesPerView: 2,
			},
			0: {
				slidesPerView: 1,
			},
		},

		// Navigation arrows
		navigation: {
			nextEl: ".slider-next",
			prevEl: ".slider-prev",
		},
	});

	// main-home banner-classic-active js
	var slider = new Swiper(".banner-classic-active", {
		speed: 1500,
		slidesPerView: 1,
		spaceBetween: 30,
		loop: true,
		autoplay: true,
		breakpoints: {
			1920: {
				slidesPerView: 1,
			},
			1400: {
				slidesPerView: 1,
			},
			1200: {
				slidesPerView: 1,
			},
			992: {
				slidesPerView: 1,
			},
			768: {
				slidesPerView: 1,
			},
			576: {
				slidesPerView: 1,
			},
			0: {
				slidesPerView: 1,
			},
		},

		// Navigation arrows
		navigation: {
			nextEl: ".slider-next",
			prevEl: ".slider-prev",
		},
	});


	// main-home banner-classic-active js
	var slider = new Swiper(".banner-classic-active2", {
		speed: 1500,
		slidesPerView: 1,
		spaceBetween: 30,
		loop: true,
		autoplay: true,
		effect: "coverflow",
		coverflowEffect: {
			rotate: 50,
			stretch: 0,
			depth: 100,
			modifier: 1,
			slideShadows: true,
		},
		breakpoints: {
			1920: {
				slidesPerView: 1,
			},
			1400: {
				slidesPerView: 1,
			},
			1200: {
				slidesPerView: 1,
			},
			992: {
				slidesPerView: 1,
			},
			768: {
				slidesPerView: 1,
			},
			576: {
				slidesPerView: 1,
			},
			0: {
				slidesPerView: 1,
			},
		},

		// Navigation arrows
		navigation: {
			nextEl: ".slider-next",
			prevEl: ".slider-prev",
		},
	});

	// main-home service-classic-active
	var slider = new Swiper(".service-classic-active", {
		speed: 1500,
		slidesPerView: 4,
		spaceBetween: 30,
		loop: true,
		autoplay: false,
		breakpoints: {
			1920: {
				slidesPerView: 3,
			},
			1400: {
				slidesPerView: 3,
			},
			1200: {
				slidesPerView: 3,
			},
			992: {
				slidesPerView: 2,
			},
			768: {
				slidesPerView: 2,
			},
			576: {
				slidesPerView: 1,
			},
			0: {
				slidesPerView: 1,
			},
		},

		// Navigation arrows
		navigation: {
			nextEl: ".slider-next",
			prevEl: ".slider-prev",
		},
	});

	// main-home project-classic-active
	var slider = new Swiper(".project-classic-active", {
		speed: 1500,
		slidesPerView: 4,
		spaceBetween: 30,
		loop: true,
		autoplay: false,
		breakpoints: {
			1920: {
				slidesPerView: 3,
			},
			1400: {
				slidesPerView: 3,
			},
			1200: {
				slidesPerView: 3,
			},
			992: {
				slidesPerView: 2,
			},
			768: {
				slidesPerView: 2,
			},
			576: {
				slidesPerView: 1,
			},
			0: {
				slidesPerView: 1,
			},
		},

		// Navigation arrows
		navigation: {
			nextEl: ".slider-next",
			prevEl: ".slider-prev",
		},
	});

	// main-home testi-classic-active
	var slider = new Swiper(".testi-classic-active", {
		speed: 1500,
		slidesPerView: 4,
		spaceBetween: 30,
		loop: true,
		autoplay: false,
		breakpoints: {
			1920: {
				slidesPerView: 2,
			},
			1400: {
				slidesPerView: 2,
			},
			1200: {
				slidesPerView: 2,
			},
			992: {
				slidesPerView: 2,
			},
			768: {
				slidesPerView: 1,
			},
			576: {
				slidesPerView: 1,
			},
			0: {
				slidesPerView: 1,
			},
		},

		// Navigation arrows
		navigation: {
			nextEl: ".slider-next",
			prevEl: ".slider-prev",
		},
	});

	// feature-home2-active
	var slider = new Swiper(".feature-home2-active", {
		speed: 1500,
		slidesPerView: 4,
		spaceBetween: 30,
		loop: true,
		autoplay: true,
		breakpoints: {
			1920: {
				slidesPerView: 3,
			},
			1400: {
				slidesPerView: 3,
			},
			1200: {
				slidesPerView: 3,
			},
			992: {
				slidesPerView: 2,
			},
			768: {
				slidesPerView: 2,
			},
			576: {
				slidesPerView: 1,
			},
			0: {
				slidesPerView: 1,
			},
		},

		// Navigation arrows
		navigation: {
			nextEl: ".slider-next",
			prevEl: ".slider-prev",
		},
	});

	// service-home2-active
	var slider = new Swiper(".service-home2-active", {
		speed: 1500,
		slidesPerView: 4,
		spaceBetween: 30,
		loop: true,
		autoplay: true,
		breakpoints: {
			1920: {
				slidesPerView: 4,
			},
			1400: {
				slidesPerView: 3,
			},
			1200: {
				slidesPerView: 3,
			},
			992: {
				slidesPerView: 2,
			},
			768: {
				slidesPerView: 1,
			},
			576: {
				slidesPerView: 1,
			},
			0: {
				slidesPerView: 1,
			},
		},

		// Navigation arrows
		navigation: {
			nextEl: ".slider-next",
			prevEl: ".slider-prev",
		},
	});

	// project-home2-active
	var slider = new Swiper(".project-home2-active", {
		speed: 1500,
		slidesPerView: 4,
		spaceBetween: 30,
		loop: true,
		autoplay: true,
		breakpoints: {
			1920: {
				slidesPerView: 2,
			},
			1400: {
				slidesPerView: 2,
			},
			1200: {
				slidesPerView: 2,
			},
			992: {
				slidesPerView: 2,
			},
			768: {
				slidesPerView: 1,
			},
			576: {
				slidesPerView: 1,
			},
			0: {
				slidesPerView: 1,
			},
		},

		// Navigation arrows
		navigation: {
			nextEl: ".slider-next",
			prevEl: ".slider-prev",
		},
	});

	// testi-home2-active
	var slider = new Swiper(".testi-home2-active", {
		speed: 1500,
		slidesPerView: 4,
		spaceBetween: 30,
		autoplay: false,
		slidesPerView: "auto",
		loop: false,
		slidesPerView: 3.5,
		loop: false,
		centeredSlides: false,
		watchOverflow: true,
		breakpoints: {
			1920: {
				slidesPerView: 3,
			},
			1400: {
				slidesPerView: 3,
			},
			1200: {
				slidesPerView: 3,
			},
			992: {
				slidesPerView: 2,
			},
			768: {
				slidesPerView: 1,
			},
			576: {
				slidesPerView: 1,
			},
			0: {
				slidesPerView: 1,
			},
		},

		// Navigation arrows
		navigation: {
			nextEl: ".slider-next",
			prevEl: ".slider-prev",
		},
	});

	// banner-home2-classic-active
	var slider = new Swiper(".banner-home2-classic-active", {
		speed: 1500,
		slidesPerView: 4,
		spaceBetween: 30,
		loop: true,
		autoplay: true,
		breakpoints: {
			1920: {
				slidesPerView: 1,
			},
			1400: {
				slidesPerView: 1,
			},
			1200: {
				slidesPerView: 1,
			},
			992: {
				slidesPerView: 1,
			},
			768: {
				slidesPerView: 1,
			},
			576: {
				slidesPerView: 1,
			},
			0: {
				slidesPerView: 1,
			},
		},

		// Navigation arrows
		navigation: {
			nextEl: ".slider-next",
			prevEl: ".slider-prev",
		},
	});

	// service-home2-classic-active
	var slider = new Swiper(".service-home2-classic-active", {
		speed: 1500,
		slidesPerView: 4,
		spaceBetween: 30,
		loop: true,
		autoplay: true,
		breakpoints: {
			1920: {
				slidesPerView: 4,
			},
			1400: {
				slidesPerView: 3,
			},
			1200: {
				slidesPerView: 3,
			},
			992: {
				slidesPerView: 2,
			},
			768: {
				slidesPerView: 1,
			},
			576: {
				slidesPerView: 1,
			},
			0: {
				slidesPerView: 1,
			},
		},

		// Navigation arrows
		navigation: {
			nextEl: ".slider-next",
			prevEl: ".slider-prev",
		},
	});

	// testi-home2-classic-active
	var slider = new Swiper(".testi-home2-classic-active", {
		speed: 1500,
		slidesPerView: 4,
		spaceBetween: 30,
		loop: true,
		autoplay: true,
		breakpoints: {
			1920: {
				slidesPerView: 2,
			},
			1400: {
				slidesPerView: 2,
			},
			1200: {
				slidesPerView: 2,
			},
			992: {
				slidesPerView: 2,
			},
			768: {
				slidesPerView: 1,
			},
			576: {
				slidesPerView: 1,
			},
			0: {
				slidesPerView: 1,
			},
		},

		// Navigation arrows
		navigation: {
			nextEl: ".slider-next",
			prevEl: ".slider-prev",
		},
	});

	// testi-home2-active
	var slider = new Swiper(".testi-home3-active", {
		speed: 1500,
		slidesPerView: 4,
		spaceBetween: 30,
		autoplay: false,
		slidesPerView: "auto",
		loop: false,
		slidesPerView: 3.5,
		centeredSlides: false,
		watchOverflow: true,
		breakpoints: {
			1920: {
				slidesPerView: 3,
			},
			1400: {
				slidesPerView: 3,
			},
			1200: {
				slidesPerView: 3,
			},
			992: {
				slidesPerView: 2,
			},
			768: {
				slidesPerView: 1,
			},
			576: {
				slidesPerView: 1,
			},
			0: {
				slidesPerView: 1,
			},
		},

		// Navigation arrows
		navigation: {
			nextEl: ".slider-next",
			prevEl: ".slider-prev",
		},
	});

	// banner-home3-classic-active
	var slider = new Swiper(".banner-home3-classic-active", {
		speed: 1500,
		slidesPerView: 4,
		spaceBetween: 30,
		loop: true,
		autoplay: false,
		breakpoints: {
			1920: {
				slidesPerView: 1,
			},
			1400: {
				slidesPerView: 1,
			},
			1200: {
				slidesPerView: 1,
			},
			992: {
				slidesPerView: 1,
			},
			768: {
				slidesPerView: 1,
			},
			576: {
				slidesPerView: 1,
			},
			0: {
				slidesPerView: 1,
			},
		},

		// Navigation arrows
		navigation: {
			nextEl: ".slider-next",
			prevEl: ".slider-prev",
		},
	});

	// testi-home3-classic-active
	var slider = new Swiper(".testi-home3-classic-active", {
		speed: 1500,
		slidesPerView: 4,
		spaceBetween: 30,
		loop: true,
		autoplay: true,
		breakpoints: {
			1920: {
				slidesPerView: 2,
			},
			1400: {
				slidesPerView: 2,
			},
			1200: {
				slidesPerView: 2,
			},
			992: {
				slidesPerView: 2,
			},
			768: {
				slidesPerView: 1,
			},
			576: {
				slidesPerView: 1,
			},
			0: {
				slidesPerView: 1,
			},
		},

		// Navigation arrows
		navigation: {
			nextEl: ".slider-next",
			prevEl: ".slider-prev",
		},
	});

	// blog-details-active
	var slider = new Swiper(".blog-details-active", {
		speed: 1500,
		loop: true,
		slidesPerView: 2,
		grabCursor: true,
		autoplay: false,
		breakpoints: {
			1920: {
				slidesPerView: 2,
			},
			1400: {
				slidesPerView: 2,
			},
			1200: {
				slidesPerView: 2,
			},
			992: {
				slidesPerView: 1,
			},
			768: {
				slidesPerView: 1,
			},
			576: {
				slidesPerView: 1,
			},
			0: {
				slidesPerView: 1,
			},
		},

		navigation: {
			nextEl: ".slider-next",
			prevEl: ".slider-prev",
		},


	});

	/* Image Reveal Animation */
	if ($('.reveal').length) {
		gsap.registerPlugin(ScrollTrigger);
		let revealContainers = document.querySelectorAll(".reveal");
		revealContainers.forEach((container) => {
			let image = container.querySelector("img");
			let tl = gsap.timeline({
				scrollTrigger: {
					trigger: container,
					toggleActions: "play none none none"
				}
			});
			tl.set(container, {
				autoAlpha: 1
			});
			tl.from(container, 1, {
				xPercent: -100,
				ease: Power2.out
			});
			tl.from(image, 1, {
				xPercent: 100,
				scale: 1,
				delay: -1,
				ease: Power2.out
			});
		});
	}

	/* Text Effect Animation */
	if ($('.text-anime-3').length) {
		let animatedTextElements = document.querySelectorAll('.text-anime-3');

		animatedTextElements.forEach((element) => {
			//Reset if needed
			if (element.animation) {
				element.animation.progress(1).kill();
				element.split.revert();
			}

			element.split = new SplitText(element, {
				type: "lines,words,chars",
				linesClass: "split-line",
			});
			gsap.set(element, { perspective: 400 });

			gsap.set(element.split.chars, {
				opacity: 0,
				x: "50",
			});

			element.animation = gsap.to(element.split.chars, {
				scrollTrigger: { trigger: element, start: "top 90%" },
				x: "0",
				y: "0",
				rotateX: "0",
				opacity: 1,
				duration: 1,
				ease: Back.easeOut,
				stagger: 0.02,
			});
		});
	}

	// Title Animation
	let splitTitleLines = gsap.utils.toArray(".title-anim");

	splitTitleLines.forEach(splitTextLine => {
		const tl = gsap.timeline({
			scrollTrigger: {
				trigger: splitTextLine,
				start: 'top 90%',
				end: 'bottom 60%',
				scrub: false,
				markers: false,
				toggleActions: 'play none none none'
			}
		});
		const itemSplitted = new SplitText(splitTextLine, { type: "words, lines" });
		gsap.set(splitTextLine, { perspective: 400 });
		itemSplitted.split({ type: "lines" })
		tl.from(itemSplitted.lines, { duration: 1, delay: 0.3, opacity: 0, rotationX: -80, force3D: true, transformOrigin: "top center -50", stagger: 0.1 });
	});

	// Scroll down area start here ***
	$(document).on("click", "#scrollDown", function () {
		setTimeout(function () {
			$("html, body").animate({ scrollTop: "+=1000px" }, "slow");
		}, 1000);
	});
	// Scroll down area end here ***


	// // project box item scrool
	// window.addEventListener("load", () => {
	// 	gsap.registerPlugin(ScrollTrigger);

	// 	const width = window.innerWidth;
	// 	const panels = gsap.utils.toArray(".project-box-item");

	// 	const endEl = document.querySelector(".project-section-one");
	// 	if (!endEl) {
	// 		return;
	// 	}

	// 	panels.forEach((panel, i) => {
	// 		gsap.set(panel, { zIndex: i });

	// 		ScrollTrigger.create({
	// 			trigger: panel,
	// 			start: "top 10%",
	// 			end:
	// 				width >= 1600
	// 					? "bottom 90%"
	// 					: width >= 1400
	// 						? "bottom 160%"
	// 						: "bottom 170%",
	// 			endTrigger: endEl,
	// 			pin: true,
	// 			pinSpacing: false,
	// 			scrub: 1,
	// 			markers: false,
	// 		});
	// 	});
	// });

	
	// project box item scroll
window.addEventListener("load", () => {

    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const mm = gsap.matchMedia();

    mm.add("(min-width: 992px)", () => {

        const width = window.innerWidth;
        const panels = gsap.utils.toArray(".project-box-item");

        const endEl = document.querySelector(".project-section-one");
        if (!endEl) return;

        panels.forEach((panel, i) => {

            gsap.set(panel, { zIndex: i });

            ScrollTrigger.create({
                trigger: panel,
                start: "top 10%",
                end:
                    width >= 1600
                        ? "bottom 90%"
                        : width >= 1400
                        ? "bottom 160%"
                        : "bottom 170%",
                endTrigger: endEl,
                pin: true,
                pinSpacing: false,
                scrub: 1,
                markers: false,
            });

        });

    });

});


	// testimonal opacity
	gsap.registerPlugin(ScrollTrigger);

	const width = window.innerWidth;
	const boxes = gsap.utils.toArray(".single-testi-box");
	const container = document.getElementById("scroll-container");
	const stickyBox = document.getElementById("sticky-box");

	// Sticky right box
	if (width >= 1200) {
		ScrollTrigger.create({
			trigger: stickyBox,
			start: "top 9%",
			endTrigger: container,
			end:
				width >= 1700
					? "bottom 103.2%"
					: width >= 1400
						? "bottom 180%"
						: "bottom 160%",
			pin: true,
			pinSpacing: false,
			scrub: false,
		});
	}

	// Activate content boxes
	boxes.forEach((box, i) => {
		ScrollTrigger.create({
			trigger: box,
			start: "top 50%",
			end: "bottom 50%",
			onEnter: () => {
				for (let j = 0; j <= i; j++) {
					boxes[j].classList.add("before-opacity-0");
				}
			},
			onLeaveBack: () => {
				for (let j = i; j < boxes.length; j++) {
					boxes[j].classList.remove("before-opacity-0");
				}
			}
		});
	});

	// When reaching bottom: fade out all
	gsap.registerPlugin(ScrollTrigger);
	document.querySelectorAll('.box').forEach(box => {
		// optionally you can add reverse tween from opacity 1 to 0.5
		gsap.to(box, {
			opacity: 1,
			ease: "none",
			scrollTrigger: {
				trigger: box,
				start: "top 20%",
				end: "bottom 20%",
				scrub: true,
			}
		});

		gsap.to(box, {
			opacity: 0.3,
			ease: "none",
			scrollTrigger: {
				trigger: box,
				start: "top 80%",
				end: "top 20%",
				scrub: true,
			}
		});
	});

	// give donation form
	document.addEventListener("DOMContentLoaded", function () {
		const amountButtons = document.querySelectorAll(".preset-buttons .amount");
		const input = document.getElementById("donationAmount");

		if (!input || amountButtons.length === 0) {
			return;
		}

		amountButtons.forEach(btn => {
			btn.addEventListener("click", () => {
				amountButtons.forEach(b => b.classList.remove("active"));
				btn.classList.add("active");

				if (!btn.classList.contains("custom")) {
					input.value = btn.dataset.amount;
					input.placeholder = "";
					input.classList.remove("placeholder-active");
				} else {
					input.value = "";
					input.placeholder = "Enter amount";
					input.classList.add("placeholder-active");
					input.focus();
				}
			});
		});

		input.addEventListener("input", () => {
			amountButtons.forEach(b => b.classList.remove("active"));
			input.classList.remove("placeholder-active");
		});
	});

	// service-box active js
	$(function () {
		$(document).on('mouseenter', '.joint-event-box', function () {
			$(this).addClass('active'); // Add the 'active'
			$('.joint-event-box').not(this).removeClass('active'); // Remove the 'active'
		});
	});


	// box animation gsap
	window.addEventListener("DOMContentLoaded", function () {
		gsap.registerPlugin(ScrollTrigger);

		gsap.utils.toArray(".fade-in").forEach((el) => {
			gsap.fromTo(
				el,
				{ opacity: 0, y: 50 },
				{
					opacity: 1,
					y: 0,
					duration: 1.5,           // Smooth duration
					ease: "power2.out",      // Smooth easing
					scrollTrigger: {
						trigger: el,
						start: "top 85%",      // When 85% of element enters viewport
						toggleActions: "play none none none"
					}
				}
			);
		});
	});

	$(window).on("scroll", function () {
		const header = document.querySelector(".main-header");
		if (window.scrollY > 100) {
			header.classList.add("scrolled");
		} else {
			header.classList.remove("scrolled");
		}
	});

	//fade-top gsap animation
	if (document.querySelectorAll(".fade-wrapper").length > 0) {
		$(".fade-wrapper").each(function () {
			var section = $(this);
			var fadeItems = section.find(".fade-up");

			fadeItems.each(function (index, element) {
				var delay = index * 0.1;

				gsap.set(element, {
					opacity: 0,
					y: 70,
				});

				ScrollTrigger.create({
					trigger: element,
					start: "top 95%",
					end: "bottom bottom",
					scrub: false,
					toggleActions: "play none none reverse",
					onEnter: function () {
						gsap.to(element, {
							opacity: 1,
							y: 0,
							duration: 0.6,
							delay: delay
						});
					},
					onLeaveBack: function () {
						gsap.to(element, { opacity: 0, y: 70, duration: 0.5 });
					}
				});
			});
		});
	}


	// next previous buttons
	document.addEventListener('DOMContentLoaded', function () {
		const nextBtn = document.getElementById('nextBtn');
		const prevBtn = document.getElementById('prevBtn');

		if (nextBtn) {
			nextBtn.addEventListener('click', () => {
				slider.slideNext();
			});
		}

		if (prevBtn) {
			prevBtn.addEventListener('click', () => {
				slider.slidePrev();
			});
		}
	});



})(window.jQuery);


