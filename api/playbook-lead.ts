// Vercel serverless function: relays playbook lead-form submissions (free
// guide + notify-me) to the existing n8n lead-intake webhook. Mirrors
// api/contact.ts. Env var: N8N_LEAD_WEBHOOK_URL (already set in Vercel).

interface LeadBody {
  name?: string;
  email?: string;
  interest?: string;
  website?: string; // honeypot: real users never fill this
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body: LeadBody = req.body && typeof req.body === 'object' ? req.body : {};
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim();
  const interest = String(body.interest || '').trim();
  const honeypot = String(body.website || '').trim();

  // silent drop for bots: pretend success, relay nothing
  if (honeypot) return res.status(200).json({ ok: true });

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }
  if (name.length > 200) {
    return res.status(400).json({ error: 'Name too long (200 char max).' });
  }
  if (interest !== 'guide' && interest !== 'notify') {
    return res.status(400).json({ error: 'Invalid interest.' });
  }

  const webhookUrl = process.env.N8N_LEAD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.error('N8N_LEAD_WEBHOOK_URL not set');
    return res.status(500).json({ error: 'Server misconfigured.' });
  }

  const payload = {
    name,
    email,
    interest,
    source: 'playbook',
    submittedAt: new Date().toISOString(),
    userAgent: String(req.headers['user-agent'] || '').slice(0, 500),
  };

  try {
    const r = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!r.ok) {
      console.error('n8n webhook responded', r.status);
      return res.status(502).json({ error: 'Could not record your details. Please retry.' });
    }
  } catch (err) {
    console.error('n8n webhook unreachable', err);
    return res.status(502).json({ error: 'Could not record your details. Please retry.' });
  }

  return res.status(200).json({ ok: true });
}
