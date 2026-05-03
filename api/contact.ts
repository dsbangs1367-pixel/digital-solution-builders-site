// Vercel serverless function: relays DSB contact form submissions to the n8n
// lead-intake webhook. Keeps the n8n URL server-side so it isn't exposed in
// client JS or scrapeable from the public repo.
//
// Required env var (set in Vercel Project Settings → Environment Variables):
//   N8N_LEAD_WEBHOOK_URL = https://dsbdigital.app.n8n.cloud/webhook/dsb-contact-form

interface ContactBody {
  name?: string;
  email?: string;
  company?: string;
  projectType?: string;
  message?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body: ContactBody = (req.body && typeof req.body === 'object') ? req.body : {};
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim();
  const message = String(body.message || '').trim();

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }
  if (name.length > 200) {
    return res.status(400).json({ error: 'Name too long (200 char max).' });
  }
  if (message.length > 5000) {
    return res.status(400).json({ error: 'Message too long (5000 char max).' });
  }
  const company = String(body.company || '').trim();
  if (company.length > 200) {
    return res.status(400).json({ error: 'Company too long (200 char max).' });
  }

  const webhookUrl = process.env.N8N_LEAD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.error('N8N_LEAD_WEBHOOK_URL not set');
    return res.status(500).json({ error: 'Server misconfigured.' });
  }

  const payload = {
    name,
    email,
    company,
    projectType: String(body.projectType || '').trim().slice(0, 100),
    message,
    source: 'dsbdigital.biz',
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
      console.error('n8n webhook returned', r.status);
      return res.status(502).json({ error: 'Could not deliver message right now.' });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('n8n webhook fetch failed', err);
    return res.status(502).json({ error: 'Network error reaching message handler.' });
  }
}
