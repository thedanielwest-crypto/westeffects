// POST /.netlify/functions/checkout   body: { photo: "sparks-01", size: "A3" }
// Creates a Stripe Checkout Session (one print, AUD, Australian shipping) and returns { url }.
// Prices come from lib/catalogue.mjs on the server, never from the browser.
import { json } from './lib/shared.mjs';
import { SIZES, SHIPPING, PHOTOS } from './lib/catalogue.mjs';

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);
  if (process.env.SHOP_OPEN !== 'true') return json({ error: 'The print shop is not open yet.' }, 503);
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return json({ error: 'Shop is not configured.' }, 503);

  let data;
  try { data = await req.json(); } catch { return json({ error: 'Invalid request' }, 400); }
  const title = PHOTOS[data.photo];
  const size = SIZES[data.size];
  if (!title || !size) return json({ error: 'Unknown print.' }, 400);

  const site = (process.env.SITE_URL || new URL(req.url).origin).replace(/\/$/, '');
  const p = new URLSearchParams();
  p.set('mode', 'payment');
  p.set('success_url', `${site}/westlight/?order=thanks`);
  p.set('cancel_url', `${site}/westlight/`);
  p.set('line_items[0][quantity]', '1');
  p.set('line_items[0][price_data][currency]', 'aud');
  p.set('line_items[0][price_data][unit_amount]', String(size.cents));
  p.set('line_items[0][price_data][product_data][name]', `${title}, ${data.size} print`);
  p.set('line_items[0][price_data][product_data][description]', `Westlight limited print, ${size.label}`);
  p.set('shipping_address_collection[allowed_countries][0]', 'AU');
  p.set('shipping_options[0][shipping_rate_data][type]', 'fixed_amount');
  p.set('shipping_options[0][shipping_rate_data][display_name]', SHIPPING.label);
  p.set('shipping_options[0][shipping_rate_data][fixed_amount][amount]', String(SHIPPING.cents));
  p.set('shipping_options[0][shipping_rate_data][fixed_amount][currency]', 'aud');
  p.set('metadata[photo]', data.photo);
  p.set('metadata[title]', title);
  p.set('metadata[size]', data.size);

  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: p.toString(),
  });
  const out = await res.json();
  if (!res.ok || !out.url) {
    console.error('stripe error', JSON.stringify(out));
    return json({ error: 'Could not start checkout.' }, 502);
  }
  return json({ url: out.url });
};
