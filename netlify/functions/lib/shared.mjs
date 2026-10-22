// Shared helpers for the Westeffects Netlify Functions.
// Airtable base: "Westeffects Site" (tables Leads and Orders). Field IDs are used, not names.

export const BASE_ID = process.env.AIRTABLE_BASE_ID || 'appfs1WrH50VUd9pg';
export const TABLES = { leads: 'tblDYO9Ftsw1JqAss', orders: 'tblfvG3T3RcG9llwl' };
export const LEADS = {
  email: 'fldr5GZpYqQnl5lZc', source: 'fldaOPCjCjNPKxhAw', name: 'fldDD5qTtPpaYci8t',
  message: 'fld9LjdE4wirfCqjc', status: 'fldJuyAlaB4Qvyn2j', submitted: 'fldIVpWhbRx8XQlse',
};
export const ORDERS = {
  order: 'fld7KRaRdNqc72hvF', email: 'fldHy1gZKTSdvo564', items: 'fld415XJA0tfPEoUH',
  total: 'fldaRq5RaRcw2mMDq', status: 'fldjkRP87alX969Um', shipping: 'fldsBkUTCUbad6thr',
  session: 'fldUNF7yRckckiVga', created: 'fld0JBKLv6Ok6lhuZ',
};

export const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export async function airtableCreate(tableId, fields) {
  const token = process.env.AIRTABLE_TOKEN;
  if (!token) throw new Error('AIRTABLE_TOKEN is not set');
  const res = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${tableId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ records: [{ fields }], typecast: true }),
  });
  if (!res.ok) throw new Error(`Airtable ${res.status}: ${await res.text()}`);
  return res.json();
}

export async function airtableFind(tableId, formula) {
  const token = process.env.AIRTABLE_TOKEN;
  if (!token) throw new Error('AIRTABLE_TOKEN is not set');
  const url = `https://api.airtable.com/v0/${BASE_ID}/${tableId}?maxRecords=1&filterByFormula=${encodeURIComponent(formula)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Airtable ${res.status}: ${await res.text()}`);
  return (await res.json()).records || [];
}

// Optional: tell a Make.com scenario (custom webhook) so it can email Westy. Never blocks the main job.
export async function pingMake(payload) {
  const url = process.env.MAKE_WEBHOOK_URL;
  if (!url) return;
  try {
    await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  } catch (_) { /* ignore */ }
}
