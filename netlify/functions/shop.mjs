// GET /.netlify/functions/shop
// Tells the Westlight page whether the print shop is open, and which sizes/prices to show.
// The shop stays closed until the environment variable SHOP_OPEN is set to "true".
import { json } from './lib/shared.mjs';
import { SIZES, SHIPPING, PHOTOS } from './lib/catalogue.mjs';

export default async () => {
  const open = process.env.SHOP_OPEN === 'true' && !!process.env.STRIPE_SECRET_KEY;
  if (!open) return json({ open: false });
  return json({
    open: true,
    sizes: Object.entries(SIZES).map(([id, s]) => ({ id, label: s.label, cents: s.cents })),
    shipping: SHIPPING,
    photos: Object.keys(PHOTOS),
  });
};
