@AGENTS.md

# Gallery Flow — Codebase Guide

## Project Overview

Gallery Flow is an open-source, single-tenant photo gallery system for photographers to share password-protected galleries with clients. It supports two user roles: **Photographer** (admin) and **Client** (viewer). The UI and user-facing text are in German.

**Tech stack:** Next.js 16.2.4 (App Router) · React 19 · TypeScript 5 (strict) · Prisma 5 (PostgreSQL) · NextAuth.js v4 · Tailwind CSS v4 · shadcn/ui · Sharp (image compression) · Supabase (optional cloud storage) · Brevo (transactional email)

---

## Repository Structure

```
Gallery-flow/
├── app/                    # Next.js App Router
│   ├── api/                # API route handlers
│   ├── (auth)/             # Login page (route group, no layout chrome)
│   ├── (dashboard)/        # Photographer dashboard (sidebar layout)
│   └── (gallery)/          # Client-facing gallery pages
├── components/
│   ├── dashboard/          # Sidebar, cards, upload zone
│   ├── gallery/            # Six layout renderers + lightbox + favorites
│   └── shared/             # Download and review buttons
├── lib/                    # Server-side utilities
│   ├── auth.ts             # NextAuth config (two credential providers)
│   ├── prisma.ts           # Singleton PrismaClient
│   ├── storage.ts          # saveFile() abstraction (local / Supabase)
│   ├── sharp.ts            # compressImage() → WebP
│   ├── brevo.ts            # sendEmail() wrapper
│   ├── supabase.ts         # Supabase anon + admin clients
│   └── utils.ts            # shadcn/ui cn() helper
├── prisma/
│   └── schema.prisma       # Database schema (4 models, 2 enums)
├── types/
│   └── index.ts            # Shared interfaces + NextAuth augmentation
├── emails/
│   └── SneakPeakEmail.tsx  # Transactional email template
├── middleware.ts            # Route protection via NextAuth
├── next.config.ts
├── .env.example
└── components.json         # shadcn/ui config
```

Path alias `@/` maps to the repository root.

---

## Database Schema

Five models in PostgreSQL via Prisma ORM:

| Model | Key fields | Notes |
|---|---|---|
| `Photographer` | `id`, `email` (unique), `name`, `password`, `logoUrl`, `accentColor`, `footerText`, `googleReviewUrl` | Single row per app instance; created manually via Prisma Studio |
| `Client` | `id`, `email`, `name`, `password`, `photographerId` | Composite unique on `(email, photographerId)` |
| `Gallery` | `id`, `slug` (unique), `title`, `design`, `status`, `clientId`, `photographerId` | `slug` is the URL path segment |
| `Photo` | `id`, `filename`, `previewUrl`, `isSneakPeak`, `sortOrder`, `width`, `height`, `sizeBytes` | `previewUrl` points to compressed WebP |
| `Favorite` | `clientId`, `photoId` | Composite unique; junction table |

**Enums:**
- `GalleryDesign`: `GRID | MASONRY | HORIZONTAL | SLIDESHOW | MAGAZINE | POLAROID`
- `GalleryStatus`: `DRAFT | SNEAK_PEAK | PUBLISHED | EXPIRED`

Always run `npm run db:generate` after modifying `schema.prisma`, and `npm run db:migrate` to apply changes in development.

---

## Authentication

NextAuth.js v4 with JWT session strategy and two `CredentialsProvider` instances:

- **`photographer-login`** — matches against `Photographer.email + password`; sets `userType: "photographer"` in token
- **`client-login`** — requires `email`, `password`, and `photographerId`; matches against `Client` composite key; sets `userType: "client"`, `photographerId`, and `gallerySlug` in token

**Session shape** (augmented in `types/index.ts`):
```ts
session.user.userType       // "photographer" | "client"
session.user.userId         // database id
session.user.photographerId // only for clients
session.user.gallerySlug    // first gallery slug for clients
```

**Middleware** (`middleware.ts`) enforces:
- `/dashboard/*` → photographer only
- `/gallery/*` → client only
- Unauthorized → redirect to `/login`

In API routes, always verify the session and `userType` before operating on data. No route should trust client-supplied `photographerId`; read it from `session.user` instead.

---

## API Routes

All routes live under `app/api/`:

| Route | Methods | Purpose |
|---|---|---|
| `/api/auth/[...nextauth]` | GET, POST | NextAuth handler |
| `/api/upload` | POST | Receive file, compress with Sharp, save, create `Photo` record |
| `/api/favorites` | GET, POST | List and toggle client favorites |
| `/api/photographers/me` | GET | Current photographer branding data |
| `/api/clients` | GET, POST | List / create clients |
| `/api/clients/[id]` | GET, PATCH, DELETE | Single client CRUD |
| `/api/galleries` | GET, POST | List / create galleries |
| `/api/galleries/[id]` | GET, PATCH, DELETE | Single gallery CRUD |
| `/api/galleries/download` | GET | Download handler |
| `/api/sneak-peak/send` | POST | Send sneak peak email via Brevo |

---

## Image Processing Pipeline

1. Client uploads a file via `UploadZone` (react-dropzone)
2. `POST /api/upload` receives `FormData`
3. `lib/sharp.ts` → `compressImage()`: converts to WebP, max 2400px, 75% quality; returns `{ buffer, width, height, sizeBytes }`
4. `lib/storage.ts` → `saveFile()`: writes to local filesystem (`./uploads/[galleryId]/`) or Supabase Storage bucket `gallery-photos`, controlled by `STORAGE_MODE` env var
5. Prisma creates a `Photo` record with `previewUrl`, dimensions, and file size

---

## Storage Modes

Controlled by `STORAGE_MODE` environment variable:

| Value | Behavior |
|---|---|
| `"local"` | Saves to `UPLOAD_DIR` (default: `./uploads`); good for self-hosting |
| `"supabase"` | Uploads to Supabase Storage; requires `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |

---

## Environment Variables

Copy `.env.example` to `.env.local`:

```bash
DATABASE_URL                # PostgreSQL connection string
NEXTAUTH_SECRET             # Generate: openssl rand -base64 32
NEXTAUTH_URL                # e.g. http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL    # Supabase project URL (optional)
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
BREVO_API_KEY               # Brevo transactional email
BREVO_FROM_EMAIL            # Sender address
STORAGE_MODE                # "local" | "supabase"
UPLOAD_DIR                  # Local upload path (default: ./uploads)
NEXT_PUBLIC_APP_URL         # Used in email links
```

---

## Development Workflow

```bash
npm install
cp .env.example .env.local   # fill in values
npm run db:migrate           # apply schema to DB
npm run db:generate          # generate Prisma client
npm run dev                  # start dev server on :3000
```

**Database tools:**
```bash
npm run db:migrate   # prisma migrate dev
npm run db:generate  # prisma generate
npm run db:studio    # open Prisma Studio GUI
```

**Linting / formatting:**
```bash
npm run lint         # ESLint 9 with next config
npx prettier --write # Prettier 3 (no separate script)
```

There are no automated tests in this project.

---

## Gallery Layouts

Six layout components in `components/gallery/`, selected by `gallery.design`:

| Design enum | Component | Description |
|---|---|---|
| `GRID` | `GalleryGrid.tsx` | Uniform grid (2-4 columns) |
| `MASONRY` | `GalleryMasonry.tsx` | Pinterest-style, via react-masonry-css |
| `HORIZONTAL` | `GalleryHorizontal.tsx` | Horizontal scroll |
| `SLIDESHOW` | `GallerySlideshow.tsx` | Full-screen slideshow |
| `MAGAZINE` | `GalleryMagazine.tsx` | Editorial hero + grid |
| `POLAROID` | `GalleryPolaroid.tsx` | Vintage Polaroid cards |

All layouts use `GalleryLightbox.tsx` for modal image viewing and `FavoriteButton.tsx` for heart-toggle favorites.

---

## Code Conventions

- **TypeScript strict** — no `any`; never disable strict checks
- **No default exports** for utilities and hooks; named exports only
- **shadcn/ui** — use existing UI primitives from `components/ui/`; do not install alternative component libraries
- **Tailwind CSS v4** — utility-first; CSS variables for theming (accent color comes from photographer branding stored in DB)
- **API route auth pattern** — every protected API handler must call `getServerSession(authOptions)` first and return 401 if no session or wrong `userType`
- **Prisma over raw SQL** — use Prisma client for all database operations; never construct SQL strings
- **Password handling** — hash with `bcryptjs`; never store or log plaintext passwords
- **Session as source of truth** — never trust `photographerId` from request body/query; always read from `session.user`
- **Image serving** — always use the compressed `previewUrl` (WebP); never serve original uploads directly

---

## Key Architectural Notes

- **Single-tenant:** One `Photographer` row per deployment. New photographers are added manually via Prisma Studio or a seed script — there is no self-registration.
- **Sneak peak flow:** Gallery set to `SNEAK_PEAK` status filters to photos with `isSneakPeak: true`. The `/api/sneak-peak/send` route emails the client a link using Brevo. `SneakPeakEmail.tsx` renders the email HTML.
- **Branding:** `Photographer.accentColor` and `logoUrl` are used throughout the gallery UI and email templates for white-labeling.
- **Cascading deletes:** All Prisma relations use `onDelete: Cascade`, so deleting a photographer removes all their clients, galleries, and photos.
- **Client login requires photographerId:** The login form must pass `photographerId` as a hidden field so NextAuth can scope the credential lookup to the correct photographer's client list.

---

## Adding a New Gallery Layout

1. Create `components/gallery/GalleryYourName.tsx`
2. Add `YOURNAME` to the `GalleryDesign` enum in `prisma/schema.prisma`
3. Run `npm run db:migrate` and `npm run db:generate`
4. Import and render the new component in `app/(gallery)/gallery/[gallerySlug]/page.tsx` inside the existing design switch
5. Add the option to the design selector in `app/(dashboard)/dashboard/galleries/[id]/page.tsx`

---

## Commit Style (from CONTRIBUTING.md)

```
Add: Short description of new feature
Fix: Short description of bug fix
Update: Short description of change
Refactor: Short description of restructuring
```

Branch naming: `feature/my-feature`, `fix/bug-description`
