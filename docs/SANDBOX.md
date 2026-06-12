# DSB Portfolio Site Sandbox

This is a static site — Vercel automatically handles sandboxing via preview deployments.

## Local Development

```bash
export PATH="/usr/local/bin:$HOME/.npm-global/bin:$PATH"
pnpm run dev
```

Open http://localhost:5173 in your browser.

## Vercel Preview Deployment

Every pull request automatically triggers a preview deployment on Vercel.

Preview URL format: `https://dsb-digital-<branch-name>.vercel.app`

Example: PR from branch `feat/new-service` will deploy to `https://dsb-digital-feat-new-service.vercel.app`

## Security & Data

**No PHI/PII concerns:**
- No backend
- No database
- No user authentication
- No personal data collection

Safe to use preview deployments for any change without data-isolation concerns.

## Vercel Dashboard

View deployments, preview URLs, and logs at: https://vercel.com/dsbdigital/dsb-digital

Production deploys to https://dsbdigital.biz automatically when merged to `main`.
