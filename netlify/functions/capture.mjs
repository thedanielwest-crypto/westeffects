// POST /.netlify/functions/capture
// Saves a website form submission to Airtable (Leads) and pings Make.com if MAKE_WEBHOOK_URL is set.
import { json, airtableCreate, pingMake, TABLES, LEADS } from './lib/shared.mjs';

const SOURCES = {
  'store-launch': 'Store launch',
  'project-enquiry': 'Project enquiry',
  'print-list': 'Print list',
};
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const clip = (v, n) => String(v ?? '').trim().slice(0, n);

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);
  let data;
  try { data = await req.json(); } catch { return json({ error: 'Invalid request' }, 400); }

  // Honeypot: bots fill this in. Pretend success and drop it.
  if (data['bot-field']) return json({ ok: true });

  const source = SOURCES[data['form-name']];
  const email = clip(data.email, 200).toLowerCase();
  if (!source) return json({ error: 'Unknown form' }, 400);
  if (!EMAIL_RE.test(email)) return json({ error: 'Please enter a valid email address.' }, 400);

  const name = clip(data.name, 120);
  const message = clip(data.idea || data.message, 3000);
  if (source === 'Project enquiry' && (!name || !message)) {
    return json({ error: 'Please add your name and a short description.' }, 400);
  }

  const submitted = new Date().toISOString();
  try {
    await airtableCreate(TABLES.leads, {
      [LEADS.email]: email,
      [LEADS.source]: source,
      [LEADS.name]: name || undefined,
      [LEADS.message]: message || undefined,
      [LEADS.status]: 'New',
      [LEADS.submitted]: submitted,
    });
  } catch (err) {
    console.error('capture failed', err.message);
    return json({ error: 'Could not save right now.' }, 502);
  }
  await pingMake({ type: 'lead', source, email, name, message, submitted });
  return json({ ok: true });
};
