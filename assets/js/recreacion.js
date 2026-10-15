/* Apoyo de la recreación: marca los recursos que Internet Archive no guardó */
(function ($) {
	function missing(el, label) {
		var $el = $(el), w = parseInt($el.attr('width'), 10) || $el.width() || 200, h = parseInt($el.attr('height'), 10) || $el.height() || 120;
		var box = $('<span class="pm-missing"></span>').text(label).css({ width: Math.min(w, 920), height: Math.max(40, Math.min(h, 520)) });
		if ($el.attr('alt')) box.attr('title', $el.attr('alt'));
		$el.replaceWith(box);
	}
	// Imágenes: el evento error no burbujea, se captura en fase de captura
	document.addEventListener('error', function (e) {
		var t = e.target;
		if (!t || !t.tagName) return;
		if (t.tagName === 'IMG' && t.src.indexOf('data:') !== 0) missing(t, 'Imagen no recuperada');
		if (t.tagName === 'VIDEO' || (t.tagName === 'SOURCE' && t.parentNode && t.parentNode.tagName === 'VIDEO')) missing(t.tagName === 'VIDEO' ? t : t.parentNode, 'Vídeo no recuperado');
	}, true);
	$(function () {
		// Formularios de comentarios de la web original: ya no hay servidor que los reciba
		$('#content form').not('.searchbox').on('submit', function (e) { e.preventDefault(); }).find('input, textarea, button').prop('disabled', true);
		// Imágenes que ya fallaron antes de registrar el manejador
		$('#content img, #top-a img').each(function () { if (this.complete && this.naturalWidth === 0 && this.src.indexOf('data:') !== 0) missing(this, 'Imagen no recuperada'); });
		$('video').each(function () { if (this.error || this.networkState === 3) missing(this, 'Vídeo no recuperado'); });
		// Embeds Flash (catálogos .swf, chat xat): ya no se pueden reproducir en navegadores actuales
		$('embed[type="application/x-shockwave-flash"], embed[src$=".swf"]').each(function () { missing(this, 'Contenido Flash (ya no se puede reproducir)'); });
	});
})(jQuery);
