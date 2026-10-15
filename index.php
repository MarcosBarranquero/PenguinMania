<?php
/**
 * PenguinMania — enrutador
 *
 * Cada página de la web es una carpeta con su index.html (2014/noticias/index.html…).
 * Este archivo hace que las URLs limpias (/2014/noticias/) muestren esa página en
 * cualquier servidor, sin listados de archivos, y funciona tanto en la raíz del
 * dominio como dentro de una subcarpeta.
 *
 *   Apache:            ya lo usa el .htaccess incluido
 *   Servidor de PHP:   php -S localhost:8080 index.php
 */

$raiz = __DIR__;
// Carpeta de la web dentro del servidor ('' en la raíz, '/penguinmania' en una subcarpeta…)
$docRoot = realpath($_SERVER['DOCUMENT_ROOT'] ?? '') ?: $raiz;
$base = str_starts_with(realpath($raiz), $docRoot) ? str_replace('\\', '/', substr(realpath($raiz), strlen($docRoot))) : '';
$base = rtrim($base, '/');
$url  = parse_url($_SERVER['REQUEST_URI'] ?? '/');
$ruta = rawurldecode($url['path'] ?? '/');
$query = isset($url['query']) ? '?' . $url['query'] : '';

// Ruta relativa a la carpeta de la web
if ($base !== '' && str_starts_with($ruta, $base)) $ruta = substr($ruta, strlen($base));
$ruta = '/' . ltrim($ruta, '/');

// No salir nunca de la carpeta de la web
if (str_contains($ruta, '..')) { http_response_code(400); exit; }
$fisica = $raiz . $ruta;

// Archivos reales (CSS, JS, imágenes…): con el servidor de PHP los sirve él mismo
if (is_file($fisica) && basename($fisica) !== 'index.php') {
	if (PHP_SAPI === 'cli-server') return false;
	servir($fisica);
}

// Carpeta con página: /2014/noticias → /2014/noticias/ (los enlaces son relativos y necesitan la barra)
if (is_file(rtrim($fisica, '/') . '/index.html')) {
	if (!str_ends_with($ruta, '/')) {
		header('Location: ' . $base . $ruta . '/' . $query, true, 301);
		exit;
	}
	servir(rtrim($fisica, '/') . '/index.html');
}

// URLs originales de penguinmania.es sin /2013 o /2014 (p. ej. /noticias/): a la versión donde existen
foreach (['/2014', '/2013'] as $version) {
	if (is_file($raiz . $version . rtrim($ruta, '/') . '/index.html')) {
		header('Location: ' . $base . $version . rtrim($ruta, '/') . '/' . $query, true, 301);
		exit;
	}
}

// No existe
http_response_code(404);
$inicio = htmlspecialchars($base . '/');
echo <<<HTML
<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Página no encontrada - PenguinMania</title>
<link rel="stylesheet" href="{$inicio}assets/css/selector.css"></head>
<body class="pm-selector"><div class="pagina"><header class="cabecera">
<img src="{$inicio}assets/img/logo.png" alt="PenguinMania" width="200" height="60">
<h1>Página no encontrada</h1>
<p>Esta dirección no existe en PenguinMania. <a href="{$inicio}">Volver al inicio</a>.</p>
</header></div></body></html>
HTML;
exit;

function servir(string $archivo): never {
	$tipos = [
		'html' => 'text/html; charset=utf-8', 'css' => 'text/css; charset=utf-8', 'js' => 'application/javascript; charset=utf-8',
		'json' => 'application/json; charset=utf-8', 'png' => 'image/png', 'jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg',
		'gif' => 'image/gif', 'ico' => 'image/x-icon', 'svg' => 'image/svg+xml', 'woff' => 'font/woff', 'ttf' => 'font/ttf',
		'eot' => 'application/vnd.ms-fontobject',
	];
	$ext = strtolower(pathinfo($archivo, PATHINFO_EXTENSION));
	header('Content-Type: ' . ($tipos[$ext] ?? 'application/octet-stream'));
	readfile($archivo);
	exit;
}
