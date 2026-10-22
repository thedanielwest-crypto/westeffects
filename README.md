# Westeffects: Night Market rebuild

New look for westeffects.com. Same four pages, same content, new design.

## What is in this zip
- `index.html`: home page (app-led, with store launch email capture)
- `westworks/index.html`: app shelf, store launch list, and "Build me an app" project form
- `westbeat/index.html`: hero, streaming links, 15 YouTube track tiles
- `westlight/index.html`: Sparks / Fire / Light Painting gallery with lightbox, per-photo credits, print list form
- `assets/styles.css`, `assets/site.js`: shared styling and script
- `assets/`: emblem, favicon, DJ photo
- `westlight/full`, `westlight/thumb`: gallery photos
- `netlify.toml`: publish settings and image caching

## How to deploy
1. Unzip, then replace the matching files in your GitHub repo (drag-and-drop the folders in the GitHub web editor, or upload to github.dev). Netlify redeploys automatically.
2. Manual zip deploy also works: drag the unzipped folder onto the Netlify deploys page.

## Email capture (Netlify Forms, no code or keys needed)
Three forms are included: `store-launch`, `project-enquiry`, `print-list`.
After the first deploy: Netlify > westeffects > Forms. Submissions appear there.
To get an email for each one: Forms > Form notifications > Add notification > Email.
Forms need the site deployed on Netlify; they do nothing when previewed locally.

## To do on your side
- Add app screenshots: save images in `assets/shots/` and swap the placeholder in `westworks/index.html` (instructions in a comment there).
- Check the one-line app descriptions on the Westworks page (all but West Algorithm are my wording).
- No environment variables were added, so no extra redeploy steps.

## Test checklist
1. Home, Westworks, Westbeat, Westlight all load; nav links work on each.
2. Click a Westbeat track: it opens on YouTube.
3. Westlight: click a photo, use arrows and Esc; each caption shows the right photographer.
4. Submit each form with a test email, then check Netlify > Forms.
5. Check on your phone: no sideways scrolling.
