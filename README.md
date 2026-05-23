# Solo Photography NY

Admin-only photography management app built with Next.js 15, React, TailwindCSS, Framer Motion, Firebase Authentication, Firestore, Firebase Storage, and Stripe Checkout.

The app intentionally has no signup route. Create the single admin account manually in Firebase Authentication, set the admin custom claim, and lock the app to `ADMIN_UID` or `ADMIN_EMAIL`.

## Features

- Secure admin login with Firebase Authentication and server session cookies
- Admin-only dashboard with clients, properties, galleries, revenue, pending payments, recent uploads, and upcoming shoots
- Collapsible responsive sidebar with active route highlighting
- Client management with A-Z sorting, instant search, add/edit/delete, and profile pages
- Property management sorted by ZIP, state, and city
- Gallery management with drag-and-drop multi-photo upload, upload progress, previews, favorites, fullscreen viewer, and share links
- Payment-gated public gallery links with locked previews, Stripe Checkout, webhook auto-unlock, download tracking, and confirmation state
- Firebase Storage private full-resolution files with short-lived signed delivery URLs
- Revenue and payments dashboards
- Settings for branding, watermark defaults, download permissions, email settings, session timeout, and expiration
- Loading skeletons, toast notifications, success states, dark/light toggle, global search, and keyboard shortcuts

## Stack

- Next.js 15 App Router
- React 19
- TailwindCSS
- Framer Motion
- Firebase Auth, Firestore, Storage, Hosting
- Stripe Checkout and webhooks
- Optional Resend email notifications

## Folder Structure

```text
app/
  (admin)/               Protected admin routes
  (auth)/login/          Admin login
  (public)/g/[token]/    Public client gallery route
  api/                   Auth, Stripe, gallery download, signed URL APIs
components/
  auth/                  Login UI
  clients/               Client list/detail surfaces
  dashboard/             Dashboard UI
  forms/                 Client/property/gallery forms
  galleries/             Uploads, gallery cards, photo grid
  layout/                Sidebar shell and global search
  media/                 Signed image helper
  payments/              Payment dashboard
  public/                Public gallery and checkout button
  revenue/               Revenue dashboard
  settings/              Settings UI
  ui/                    Reusable primitives
lib/
  auth/                  Session and admin guard helpers
  firebase/              Client/Admin SDK helpers and Firestore actions
  server/                Signed storage and gallery server logic
docs/                    Firebase, Stripe, schema, deployment guides
scripts/                 Admin claim helper
```

## Quick Start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Required Setup

1. Create a Firebase project.
2. Enable Firebase Authentication with Email/Password.
3. Manually create one admin user.
4. Set the admin custom claim:

   ```bash
   npm run admin:claim -- <firebase-auth-uid>
   ```

5. Set `ADMIN_UID` in `.env.local`.
6. Deploy `firestore.rules`, `firestore.indexes.json`, and `storage.rules`.
7. Create Stripe keys and a webhook for `/api/stripe/webhook`.

Full guides:

- [Firebase Setup](docs/FIREBASE_SETUP.md)
- [Stripe Setup](docs/STRIPE_SETUP.md)
- [Firestore Schema](docs/FIRESTORE_SCHEMA.md)
- [Deployment](docs/DEPLOYMENT.md)

## Security Model

- No signup UI exists.
- Admin pages require a Firebase session cookie.
- The server verifies the session against `ADMIN_UID` or `ADMIN_EMAIL`.
- Firestore and Storage rules require `request.auth.token.admin == true`.
- Stripe webhooks require signature verification.
- Gallery public URLs use unguessable tokens.
- Full-resolution downloads require paid/unlocked gallery state.
- Firebase Storage direct public reads are denied by rules.
- Secrets live in environment variables, never in Firestore settings.

## Keyboard Shortcuts

- `Cmd/Ctrl + K`: global search
- `N`: new client from the admin shell
- `Esc`: close search

## Deployment

Vercel is the simplest production target for the Next.js API routes. Firebase Hosting is also configured through Firebase framework-aware hosting.

```bash
npm run build
```

Then deploy with Vercel or:

```bash
firebase experiments:enable webframeworks
firebase deploy
```

