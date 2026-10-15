/*
 * PenguinMania — efectos de la recreación: slider, lightbox y spotlight.
 * Reescritos desde cero con la misma apariencia que los originales (que no se archivaron).
 */
(function ($) {
	$.fn.slideshow = function (options) {
		return this.each(function () {
			var o = $.extend({ autoplay: 1, interval: 5000, duration: 800, index: 0, animated: 'fade', navigation: 1, buttons: 1, caption_animation_duration: 500 }, options);
			var el = $(this), slides = el.find('ul.slides:first > li'), nav = el.find('ul.nav:first > li'),
				captions = el.find('ul.captions:first > li'), caption = el.find('.caption:first'),
				current = Math.min(o.index, slides.length - 1), timer = null, busy = false;

			if (!slides.length) return;
			// Las diapositivas no deben salirse del marco al animarse
			el.find('ul.slides:first').css({ overflow: 'hidden', position: 'relative' });
			slides.css({ top: 0, left: 0, width: '100%', overflow: 'hidden' }).hide().eq(current).show().css('z-index', 2);
			captions.hide();
			if (!o.navigation) nav.parent().hide();
			if (!o.buttons) el.find('.next, .prev').hide();

			function showCaption(i) {
				var html = captions.eq(i).html();
				caption.stop(true, true).hide();
				if (html && $.trim(html)) caption.html(html).fadeIn(o.caption_animation_duration);
			}
			function go(i, dir) {
				if (busy || i === current) return;
				busy = true;
				i = (i + slides.length) % slides.length;
				var from = slides.eq(current), to = slides.eq(i), w = el.find('ul.slides:first').width();
				nav.removeClass('active').eq(i).addClass('active');
				var done = function () { from.hide().css({ 'z-index': 1, left: 0, opacity: 1 }); to.css('z-index', 2); current = i; busy = false; showCaption(i); };
				if (/swipe/.test(o.animated)) {
					// Efecto "swipe": la nueva entra por encima y la anterior retrocede un poco y se oscurece
					var d = dir || (i > current ? 1 : -1);
					to.css({ left: d * w, 'z-index': 3, 'box-shadow': '0 0 20px rgba(0,0,0,0.6)' }).show();
					from.animate({ left: -d * w * 0.25, opacity: 0.4 }, o.duration, 'swing');
					to.animate({ left: 0 }, o.duration, 'swing', function () { to.css('box-shadow', 'none'); done(); });
				} else if (/scroll|slide/.test(o.animated)) {
					var d2 = dir || (i > current ? 1 : -1);
					to.css({ left: d2 * w, 'z-index': 3 }).show();
					from.animate({ left: -d2 * w }, o.duration);
					to.animate({ left: 0 }, o.duration, done);
				} else {
					to.css('z-index', 3).hide().fadeIn(o.duration, done);
				}
			}
			function play() { stop(); if (o.autoplay) timer = setInterval(function () { go(current + 1, 1); }, o.interval); }
			function stop() { if (timer) clearInterval(timer); timer = null; }

			nav.each(function (i) { $(this).on('click', function () { go(i); play(); }); });
			el.find('.next').on('click', function () { go(current + 1, 1); play(); });
			el.find('.prev').on('click', function () { go(current - 1, -1); play(); });
			el.on('mouseenter', stop).on('mouseleave', play);
			nav.eq(current).addClass('active');
			showCaption(current);
			play();
		});
	};
})(jQuery);

(function ($) {
	var box, overlay, group = [], index = 0, opts = {};

	function build() {
		if (box) return;
		overlay = $('<div id="lightbox-overlay"></div>').css({ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'none', 'z-index': 1100 }).appendTo('body');
		box = $('<div id="lightbox-wrap"><div id="lightbox-outer"><div id="lightbox-content"></div><a id="lightbox-close"></a><a id="lightbox-left"><span id="lightbox-left-ico"></span></a><a id="lightbox-right"><span id="lightbox-right-ico"></span></a></div><div id="lightbox-title"></div></div>')
			.css({ position: 'fixed', top: '50%', left: '50%', display: 'none', 'z-index': 1101 }).appendTo('body');
		overlay.on('click', close);
		box.find('#lightbox-close').on('click', close);
		box.find('#lightbox-left').on('click', function () { show(index - 1); });
		box.find('#lightbox-right').on('click', function () { show(index + 1); });
		$(document).on('keydown.wklightbox', function (e) {
			if (!box.is(':visible')) return;
			if (e.keyCode === 27) close();
			if (e.keyCode === 37) show(index - 1);
			if (e.keyCode === 39) show(index + 1);
		});
	}
	function close() { box.fadeOut(200); overlay.fadeOut(200); }
	function show(i) {
		if (!group.length) return;
		index = (i + group.length) % group.length;
		var a = $(group[index]), href = a.attr('href'), title = a.attr('title') || a.find('img').attr('alt') || '';
		var content = box.find('#lightbox-content').empty();
		box.find('#lightbox-left, #lightbox-right').toggle(group.length > 1);
		var place = function (w, h) {
			var maxW = $(window).width() - 80, maxH = $(window).height() - 120, r = Math.min(1, maxW / w, maxH / h);
			w = Math.round(w * r); h = Math.round(h * r);
			content.children().css({ width: w, height: h });
			box.css({ 'margin-left': -(w / 2) - 10, 'margin-top': -(h / 2) - 20 });
			box.find('#lightbox-title').text(title).toggle(!!title);
			box.fadeIn(200);
		};
		var yt = href.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/);
		if (yt) {
			content.append('<iframe src="https://www.youtube.com/embed/' + yt[1] + '?autoplay=1" frameborder="0" allowfullscreen></iframe>');
			place(640, 390);
		} else {
			var img = new Image();
			img.onload = function () { content.append(img); place(img.naturalWidth, img.naturalHeight); };
			img.onerror = function () { content.append('<div class="pm-missing">Imagen no recuperada</div>'); place(320, 200); };
			img.src = href;
		}
		overlay.css({ background: opts.overlayColor || '#000', opacity: opts.overlayOpacity || 0.7 }).fadeIn(200);
	}
	$.fn.lightbox = function (options) {
		opts = $.extend({}, opts, options);
		build();
		return this.each(function () {
			var a = $(this);
			if (a.data('wk-lightbox')) return;
			a.data('wk-lightbox', true).on('click', function (e) {
				e.preventDefault();
				var g = a.attr('data-lightbox').match(/group:([^;]+)/);
				group = g ? $('a[data-lightbox*="group:' + g[1] + '"]').get() : [this];
				show($.inArray(this, group));
			});
		});
	};
})(jQuery);

(function ($) {
	$.fn.spotlight = function (options) {
		var o = $.extend({ duration: 300 }, options);
		return this.each(function () {
			var a = $(this).addClass('spotlight').css({ position: 'relative', display: 'inline-block', overflow: 'hidden' });
			var ov = a.find('.overlay');
			if (!ov.length) ov = $('<div class="overlay overlay-default"></div>').appendTo(a);
			ov.css({ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }).hide();
			a.on('mouseenter', function () { ov.stop(true, true).fadeIn(o.duration); })
			 .on('mouseleave', function () { ov.stop(true, true).fadeOut(o.duration); });
		});
	};
})(jQuery);


/* Arranque de los efectos: slider (data-efecto="slideshow"), lightbox y spotlight */
jQuery(function ($) {
	$('[data-efecto="slideshow"]').each(function () {
		var el = $(this), o = el.data('options') || {}, ul = el.find('ul.slides:first'), lis = ul.children();
		ul.css('height', o.height || 300);
		lis.css('height', o.height || 300);
		el.find('img[data-src]').each(function () { $(this).attr('src', $(this).attr('data-src')); });
		el.slideshow(o).css('visibility', 'visible');
	});
	$('a[data-lightbox]').lightbox({ overlayColor: '#777', overlayOpacity: 0.7 });
	$('[data-spotlight]').spotlight({ duration: 300 });
});
