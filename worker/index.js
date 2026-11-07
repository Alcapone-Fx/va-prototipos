// Cloudflare Worker: recibe el feedback de la burbuja y crea un Issue en GitHub.
// El token vive SOLO aquí (secreto del Worker), nunca en la página.
// Variables: GITHUB_TOKEN (secreto), REPO ("Alcapone-Fx/va-prototipos"), ALLOWED_ORIGIN ("https://alcapone-fx.github.io")

const LABELS_OK = new Set(['feedback', 'v-vibrante', 'v-calida', 'v-series', 'v-general', 'me-gusta', 'cambiar', 'idea', 'problema']);

export default {
  async fetch(req, env) {
    const origin = req.headers.get('Origin') || '';
    const cors = {
      'Access-Control-Allow-Origin': origin === env.ALLOWED_ORIGIN ? origin : env.ALLOWED_ORIGIN,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin'
    };
    const json = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (req.method !== 'POST') return json({ error: 'method' }, 405);
    if (origin !== env.ALLOWED_ORIGIN) return json({ error: 'origin' }, 403);

    let p;
    try { p = await req.json(); } catch { return json({ error: 'json' }, 400); }
    if (p.website) return json({ ok: true, number: 0 }); // honeypot
    const title = String(p.title || '').slice(0, 120).trim();
    const body = String(p.body || '').slice(0, 4000).trim();
    if (!title || !body) return json({ error: 'empty' }, 400);
    const labels = (Array.isArray(p.labels) ? p.labels : []).filter(l => LABELS_OK.has(l));

    const r = await fetch(`https://api.github.com/repos/${env.REPO}/issues`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'va-feedback-worker',
        'X-GitHub-Api-Version': '2022-11-28'
      },
      body: JSON.stringify({ title, body, labels })
    });
    if (!r.ok) return json({ error: 'github', status: r.status }, 502);
    const issue = await r.json();
    return json({ ok: true, number: issue.number, url: issue.html_url });
  }
};
