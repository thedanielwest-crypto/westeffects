// POST /.netlify/functions/stripe-webhook
// Stripe calls this after a payment. Verifies the signature, then records the order in Airtable (Orders).
import crypto from 'node:crypto';
import { json, airtableCreate, airtableFind, pingMake, TABLES, ORDERS } from './lib/shared.mjs';

export function verifySignature(raw, header, secret, now = Date.now()) {
  if (!header || !secret) return false;
  const parts = Object.fromEntries(header.split(',').map((kv) => kv.split('=')));
  const t = parts.t;
  const v1 = header.split(',').filter((s) => s.startsWith('v1=')).map((s) => s.slice(3));
  if (!t || !v1.length) return false;
  if (Math.abs(now / 1000 - Number(t)) > 300) return false; // 5 minute tolerance
  const expected = crypto.createHmac('sha256', secret).update(`${t}.${raw}`).digest('hex');
  return v1.some((sig) => sig.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected)));
}

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);
  const raw = await req.text();
  if (!verifySignature(raw, req.headers.get('stripe-signature'), process.env.STRIPE_WEBHOOK_SECRET)) {
    return json({ error: 'Bad signature' }, 400);
  }
  const event = JSON.parse(raw);
  if (event.type !== 'checkout.session.completed') return json({ received: true });

  const s = event.data.object;
  if (s.payment_status !== 'paid') return json({ received: true });

  try {
    // Stripe can retry: skip if this session is already saved.
    const existing = await airtableFind(TABLES.orders, `{Stripe session}='${s.id}'`);
    if (existing.length) return json({ received: true, duplicate: true });

    const a = (s.shipping_details || s.collected_information?.shipping_details || {}).address || {};
    const shipName = (s.shipping_details || s.collected_information?.shipping_details || {}).name || '';
    const shipping = [shipName, a.line1, a.line2, [a.city, a.state, a.postal_code].filter(Boolean).join(' '), a.country]
      .filter(Boolean).join('\n');
    const items = `${s.metadata?.title || s.metadata?.photo} (${s.metadata?.size})`;

    await airtableCreate(TABLES.orders, {
      [ORDERS.order]: `${s.metadata?.photo || 'print'} ${s.metadata?.size || ''} ${s.id.slice(-6)}`.trim(),
      [ORDERS.email]: s.customer_details?.email,
      [ORDERS.items]: items,
      [ORDERS.total]: (s.amount_total || 0) / 100,
      [ORDERS.status]: 'Paid',
      [ORDERS.shipping]: shipping,
      [ORDERS.session]: s.id,
      [ORDERS.created]: new Date().toISOString(),
    });
    await pingMake({ type: 'order', items, total: (s.amount_total || 0) / 100, email: s.customer_details?.email, shipping });
  } catch (err) {
    console.error('order save failed', err.message);
    return json({ error: 'Could not save order' }, 500); // Stripe will retry
  }
  return json({ received: true });
};

// Stripe needs the raw body, so no body parsing config is required with the v2 Request API.
