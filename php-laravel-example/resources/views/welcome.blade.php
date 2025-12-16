<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laravel Request Example</title>
    <style>
        :root {
            --bg: #f6f7fb;
            --card: #ffffff;
            --text: #1f2937;
            --muted: #4b5563;
            --border: #e5e7eb;
            --code: #111827;
            --pill: #eef2ff;
        }
        * { box-sizing: border-box; }
        body {
            margin: 0;
            font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
            background: var(--bg);
            color: var(--text);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2.5rem 1.4rem;
        }
        .shell {
            max-width: 960px;
            width: 100%;
            background: var(--card);
            border: 1px solid var(--border);
            box-shadow: 0 12px 35px rgba(0, 0, 0, 0.06);
            border-radius: 14px;
            padding: 1.5rem 1.4rem;
        }
        header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            padding: 0 0.2rem 1rem;
            border-bottom: 1px solid var(--border);
            margin-bottom: 1rem;
        }
        h1 { margin: 0; font-size: 1.3rem; letter-spacing: 0.01em; }
        .badge {
            color: var(--text);
            font-weight: 600;
            background: var(--pill);
            border: 1px solid var(--border);
            padding: 0.3rem 0.6rem;
            border-radius: 10px;
            font-size: 0.9rem;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
            gap: 0.9rem;
        }
        .card {
            background: var(--card);
            border-radius: 10px;
            padding: 1rem 1rem;
            border: 1px solid var(--border);
        }
        .card h2 {
            margin: 0 0 0.65rem;
            font-size: 1rem;
            color: var(--muted);
            letter-spacing: 0.01em;
        }
        .card ul {
            list-style: none;
            padding: 0;
            margin: 0;
            display: grid;
            gap: 0.4rem;
        }
        .card li {
            display: flex;
            justify-content: space-between;
            gap: 0.7rem;
            font-size: 0.95rem;
        }
        .label { color: var(--muted); min-width: 120px; }
        .value { color: var(--text); word-break: break-word; text-align: right; }
        pre {
            background: var(--code);
            color: #e5e7eb;
            border-radius: 10px;
            padding: 0.95rem;
            overflow: auto;
            font-size: 0.9rem;
            line-height: 1.35;
            border: 1px solid #0b1222;
        }
        @media (max-width: 640px) {
            header { flex-direction: column; align-items: flex-start; }
            .card li { flex-direction: column; align-items: flex-start; }
            .value { text-align: left; }
        }
    </style>
</head>
<body>
    <div class="shell">
        <header>
            <div>
                <h1>Laravel Request Viewer</h1>
                <div class="badge">Env and request snapshot</div>
            </div>
            <div class="badge">Request ID: {{ $requestId }}</div>
        </header>

        <div class="grid">
            <div class="card">
                <h2>Request</h2>
                <ul>
                    <li><span class="label">Time</span><span class="value">{{ $timestamp }}</span></li>
                    <li><span class="label">Method</span><span class="value">{{ $method }}</span></li>
                    <li><span class="label">Path</span><span class="value">{{ $path }}</span></li>
                    <li><span class="label">Host</span><span class="value">{{ $host }}</span></li>
                    <li><span class="label">Protocol</span><span class="value">{{ $protocol }}</span></li>
                    <li><span class="label">IP</span><span class="value">{{ $ip }}</span></li>
                    <li><span class="label">User Agent</span><span class="value">{{ $userAgent }}</span></li>
                </ul>
            </div>
            <div class="card">
                <h2>Runtime</h2>
                <ul>
                    <li><span class="label">PHP</span><span class="value">{{ $runtime['phpVersion'] }}</span></li>
                    <li><span class="label">SAPI</span><span class="value">{{ $runtime['sapi'] }}</span></li>
                    <li><span class="label">APP_ENV</span><span class="value">{{ $runtime['appEnv'] }}</span></li>
                    <li><span class="label">APP_DEBUG</span><span class="value">{{ $runtime['appDebug'] ? 'true' : 'false' }}</span></li>
                </ul>
            </div>
        </div>

        <div class="grid" style="margin-top: 1rem;">
            <div class="card">
                <h2>Headers</h2>
                <pre>{{ json_encode($headers, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) }}</pre>
            </div>
            <div class="card">
                <h2>Environment</h2>
                <pre>{{ json_encode($env, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) }}</pre>
            </div>
        </div>
    </div>
</body>
</html>
