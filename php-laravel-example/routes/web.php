<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;

Route::get('/', function (Request $request) {
    $headers = $request->headers->all();
    ksort($headers);

    $env = $_ENV;
    ksort($env);

    return view('welcome', [
        'requestId' => (string) Str::uuid(),
        'timestamp' => now()->toAtomString(),
        'method' => $request->method(),
        'path' => $request->getRequestUri(),
        'ip' => $request->ip(),
        'host' => $request->getHost(),
        'protocol' => $request->getScheme(),
        'userAgent' => $request->userAgent() ?? '',
        'headers' => $headers,
        'env' => $env,
        'runtime' => [
            'phpVersion' => PHP_VERSION,
            'sapi' => PHP_SAPI,
            'appEnv' => env('APP_ENV', 'production'),
            'appDebug' => env('APP_DEBUG', false),
        ],
    ]);
});
