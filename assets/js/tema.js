/*
 * PenguinMania — comportamiento del tema (reescrito para la recreación)
 * Partículas flotantes del fondo, menús desplegables, alturas igualadas y "volver arriba".
 * Usa los plugins de Warp (GPL) que hay en assets/js/warp/.
 */
(function ($) {
	var BASE = window.PM_BASE || '/';

	// Partículas: puntos de luz que flotan por el fondo, como en la web original
	function particulas(total) {
		var imgs = [BASE + 'assets/img/particulas/chispa1.png', BASE + 'assets/img/particulas/chispa2.png'];
		var $body = $(document.body), azar = function (n) { return Math.ceil(Math.random() * n) - 1; };
		var alto = function () { return $body.height(); }, ancho = function () { return $body.width(); };
		function volar($p) {
			$p.animate({ top: azar(alto() - 50), left: azar(ancho() - 50) }, 2000 * (azar(10) + 5), function () { volar($p); });
		}
		for (var i = 0; i < total; i++) {
			var $p = $('<img alt="" aria-hidden="true">').attr('src', imgs[azar(imgs.length)])
				.css({ position: 'absolute', 'z-index': -azar(20), top: azar(alto() - 50), left: azar(ancho() - 50), 'pointer-events': 'none' })
				.appendTo($body);
			volar($p);
		}
	}

	var MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

	$(function () {
		particulas($('body.pm-selector').length ? 60 : 75);
		// Fecha de la barra superior (versión 2014), como hacía la web: la del día en que la visitas
		var hoy = new Date();
		$('time.pm-hoy').attr('datetime', hoy.toISOString().slice(0, 10))
			.text(('0' + hoy.getDate()).slice(-2) + '. ' + MESES[hoy.getMonth()] + ' ' + hoy.getFullYear());
		if (!$.fn.dropdownMenu) return; // el selector de versión no carga los plugins del tema
		$('.menu-sidebar').accordionMenu({ mode: 'slide' });
		$('#menu').dropdownMenu({ mode: 'slide', dropdownSelector: 'div.dropdown' });
		$('a[href="#page"]').smoothScroller({ duration: 500 });
		$('.grid-block').matchWidth('.grid-h');
		var igualar = function () {
			$('#top-a .grid-h, #top-b .grid-h, #bottom-a .grid-h, #bottom-b .grid-h').matchHeight('.deepest');
			$('#maininner, #sidebar-a, #sidebar-b').matchHeight();
		};
		igualar();
		$(window).on('load', igualar);
	});

	window.PM_particulas = particulas;
})(jQuery);
