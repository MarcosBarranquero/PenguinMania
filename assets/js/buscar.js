/*
 * PenguinMania — búsqueda sin servidor
 * Cada versión tiene un índice (2013/buscar.json, 2014/buscar.json) generado al construir la web.
 * - Búsqueda en vivo del cuadro de la cabecera (plugin "search" de Warp).
 * - Página de resultados /<versión>/buscar/?s=...
 */
(function ($) {
	var BASE = window.PM_BASE || '/', VERSION = window.PM_VERSION || '2014';
	var indiceUrl = BASE + VERSION + '/buscar.json', indice = null;
	var es2013 = VERSION === '2013';

	function cargar(cb) {
		if (indice) return cb(indice);
		$.getJSON(indiceUrl, function (d) { indice = d; cb(d); });
	}
	function normal(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
	function buscar(datos, q) {
		var n = normal(q).trim();
		if (!n) return [];
		return datos.filter(function (p) { return normal(p.t + ' ' + p.x).indexOf(n) >= 0; }).map(function (p) {
			var i = Math.max(0, normal(p.x).indexOf(n));
			return { title: p.t, url: BASE + p.u.replace(/^\//, ''), text: p.x.substr(Math.max(0, i - 60), 200) };
		});
	}
	function esc(s) { return $('<div>').text(s).html(); }

	$(function () {
		var $input = $('#search-3 input[name=s]');
		var q = new URLSearchParams(location.search).get('s') || '';
		$input.val(q);

		// En vivo: el plugin pide el índice estático y aquí se filtra
		$input.search({
			url: indiceUrl, method: 'get', param: 's',
			msgResultsHeader: es2013 ? 'Search Results' : 'Resultados de la búsqueda',
			msgMoreResults: es2013 ? 'More Results' : 'Más Resultados',
			msgNoResults: es2013 ? 'No results found' : 'No se encontraron resultados',
			onLoadedResults: function (datos) {
				indice = datos;
				var r = buscar(datos, $input.val()).slice(0, 5);
				r.forEach(function (x) { x.title = esc(x.title); x.text = esc(x.text.substr(0, 110)) + '…'; });
				return { results: r };
			}
		}).placeholder();

		// Página de resultados
		var $res = $('#pm-resultados');
		if (!$res.length) return;
		$('#pm-consulta').text(q);
		cargar(function (datos) {
			var r = buscar(datos, q);
			if (!r.length) { $res.html('<article class="item"><div class="content clearfix"><p>No se encontraron resultados.</p></div></article>'); return; }
			$res.html(r.map(function (x) {
				return '<article class="item"><header><h1 class="title"><a href="' + x.url + '">' + esc(x.title) + '</a></h1></header>' +
					'<div class="content clearfix"><p>…' + esc(x.text) + '…</p></div><p class="links"><a href="' + x.url + '">Leer más</a></p></article>';
			}).join(''));
		});
	});
})(jQuery);
