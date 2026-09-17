# Rahgeer Stories Website

Static site. No build step. Upload the folder to any host (Hostinger, cPanel, Netlify, Vercel, GitHub Pages) and it works.

## Files

- `index.html` — the whole site, section by section
- `css/styles.css` — design tokens at the top (`:root`), then one block per section
- `js/main.js` — animations (GSAP, ScrollTrigger, Draggable, Lenis), form logic, WhatsApp helpers
- `assets/logo-light.png` (white wordmark, dark backgrounds) and `assets/logo-dark.png` (dark wordmark, light backgrounds)

## Before launch (client to confirm)

All of these are currently realistic dummies:

- Prices, departure dates and seats left (Departures board + Destinations panels + hero card)
- Creator names, handles and follower counts (Creators section, marquee, gallery captions)
- Testimonials and postcard notes
- License number `PTDC/TO/GB/2021/1147` (footer + Safety section)
- Email `hello@rahgeerstories.com`
- Facebook and TikTok links in the footer and mobile menu
- FAQ policy facts (30 percent deposit, balance 7 days before, free date change 14 days before)

WhatsApp number is already `0336 7244337` everywhere (`wa.me/923367244337`).

## Swapping photos

Photos are Unsplash placeholders. Search `images.unsplash.com` in `index.html` and replace each URL with the client's own photo (use 1600px wide WebP or JPG for hero and destinations, 900px for gallery, 600px for postcards). Keep the `alt` text, and keep it free of dashes.

## Form submissions

The planner form posts JSON to `/api/inquiry` and, on success screen, opens WhatsApp with the full answers prefilled. To receive submissions by email or sheet, either:

1. Add `data-endpoint="https://formspree.io/f/XXXX"` (or any webhook URL) to `<form id="tripForm">`, or
2. Create a small backend at `/api/inquiry` that accepts the JSON payload logged in the browser console.

Footer "Alert Me" and the popup checklist both open WhatsApp with a prefilled message.

## Testing helpers

- `index.html?only=gallery` renders just one section (used for screenshots)
- `index.html?to=planner` jumps to a section on load

## Content rule

No dashes anywhere in visible copy (no em dash, en dash or hyphen as punctuation). Use commas, periods or colons.
