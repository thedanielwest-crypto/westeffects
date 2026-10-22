# Westeffects: Night Market + Airtable capture + print shop

This zip is the whole site. Unzip it and replace the files in your GitHub repo
(drag folders into github.dev). Netlify redeploys on commit.

## What is new in this version
1. **Forms save to Airtable.** Store launch list, project enquiries and the print list all land in a
   new Airtable base called **Westeffects Site** (table `Leads`, with a Status column to track follow-up).
2. **Optional email alert via Make.com.** If you set `MAKE_WEBHOOK_URL`, every new lead and order also pings Make.
3. **Westlight print shop (built, switched OFF).** Stripe Checkout, one print per order, AUD, Australian shipping.
   Paid orders are written to the Airtable `Orders` table. Nothing shows on the site until you turn it on.
4. **Westbeat polish.** Equaliser bars light up when you hover a track, and the title has a slow neon pulse.
   Both respect "reduce motion".

## New and changed files
- NEW `netlify/functions/capture.mjs`: saves form submissions to Airtable
- NEW `netlify/functions/shop.mjs`: tells the page whether the shop is open
- NEW `netlify/functions/checkout.mjs`: creates the Stripe Checkout session
- NEW `netlify/functions/stripe-webhook.mjs`: records paid orders in Airtable
- NEW `netlify/functions/lib/shared.mjs` and `lib/catalogue.mjs`: shared code, print sizes and prices
- CHANGED `index.html`, `westworks/`, `westbeat/`, `westlight/`, `assets/styles.css`, `assets/site.js`, `netlify.toml`
- No files to delete. The old Netlify Forms setup is gone, so ignore any old Forms notifications.

## Step 1: make the forms work (do this first)
Airtable base is already created: **Westeffects Site**.
1. Airtable > Developer hub > Create token. Scope `data.records:write` and `data.records:read`,
   access: only the *Westeffects Site* base.
2. Netlify > westeffects > Site configuration > Environment variables, add:
   - `AIRTABLE_TOKEN` = the token
3. **Redeploy** (Deploys > Trigger deploy). Env var changes only apply to new deploys.
4. Submit the form on the home page. A row appears in Airtable > Leads.

## Step 2 (optional): email alert through Make.com
1. Make > new scenario > Webhooks > Custom webhook > copy the URL.
2. Add Gmail (or Email) > Send an email to yourself. Map `type`, `source`, `email`, `name`, `message`.
3. Netlify env var `MAKE_WEBHOOK_URL` = the webhook URL. Redeploy.

## Step 3: open the print shop (when ready)
Before you do any of this, read the two warnings below.
1. Edit `netlify/functions/lib/catalogue.mjs`. **The prices are placeholders** (A4 $45, A3 $75, A2 $120, $10 shipping).
   Set the real sizes, prices and shipping from your printer. Remove any photo you cannot sell.
2. Stripe > Developers > Webhooks > Add endpoint: `https://westeffects.com/.netlify/functions/stripe-webhook`
   Event: `checkout.session.completed`. Copy the signing secret.
3. Netlify env vars:
   - `STRIPE_SECRET_KEY` = your key (start with a **test** key `sk_test_...`)
   - `STRIPE_WEBHOOK_SECRET` = the signing secret
   - `SITE_URL` = `https://westeffects.com`
   - `SHOP_OPEN` = `true`
4. Redeploy. "Buy this print" now appears inside the photo viewer.
5. Test with Stripe test card 4242 4242 4242 4242, confirm a row in Airtable > Orders, then swap in the live keys and webhook secret and redeploy again.
To close the shop again: set `SHOP_OPEN` to `false` and redeploy.

**Warning 1, photographer permission.** Craig English Photography and Thomas McShane own the photos credited
to them. Agree permission and any revenue split with each before selling prints of their work.
**Warning 2, file quality.** The gallery images are 2000 px wide, fine for A4 and borderline for A3. For A3 and
A2 you need the original high-resolution files at your printer, so confirm before listing large sizes.

## Test checklist
1. Home, Westworks, Westbeat, Westlight all load. Menu links work.
2. Each form (home, Westworks x2, Westlight): submit a test, see the row in Airtable.
3. Westbeat: hover a track, bars animate. Click opens YouTube.
4. Westlight: open a photo, arrows and Esc work, credit is right. No Buy button while the shop is closed.
5. After opening the shop: test purchase with the Stripe test card, order appears in Orders, thank-you banner shows.
6. Check on your phone: no sideways scrolling.

Redeploy needed: **yes**, after adding any env var.
