# Gallery Flow 📸

Open Source Fotogalerie-System für Fotografen.
Stelle deinen Kunden professionelle, passwortgeschützte Galerien bereit.

## Features

- 🖼️ 6 verschiedene Galerie-Designs (Grid, Masonry, Horizontal, Slideshow, Magazine, Polaroid)
- 🔐 Passwortgeschützte Kunden-Galerien
- ✨ Sneak Peak System mit E-Mail-Benachrichtigung
- ❤️ Favoriten-System für Kunden
- ⬇️ Download-Funktion (Preview + Original via Google Drive)
- ⭐ Bewertungs-Button (Google, etc.)
- 🎨 Branding-Anpassung (Logo, Akzentfarbe, Footer)
- 📱 Vollständig responsive

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Sprache:** TypeScript
- **Styling:** Tailwind CSS v4 + Shadcn/ui
- **Datenbank:** PostgreSQL via Prisma ORM
- **Auth:** NextAuth.js v4
- **E-Mail:** Brevo (ehemals Sendinblue)
- **Bildoptimierung:** Sharp (WebP, 75% Qualität, max. 2400px)
- **Cloud Storage:** Supabase Storage (optional) oder lokales Dateisystem

## Installation

### Voraussetzungen

- Node.js 18+
- PostgreSQL Datenbank (oder Supabase)
- Brevo Account (kostenlos bis 300 E-Mails/Tag)

### Setup

```bash
git clone https://github.com/light-down/gallery-flow
cd gallery-flow
npm install
cp .env.example .env.local
# .env.local mit deinen Werten befüllen
npx prisma migrate dev --name init
npm run dev
```

### Ersten Fotografen anlegen

Da kein öffentliches Registrierungsformular vorhanden ist (Single-Tenant-System), lege den Fotografen direkt in der Datenbank an:

```bash
npx prisma studio
```

### Konfiguration

Alle Einstellungen können nach dem Login unter `/dashboard/settings` angepasst werden:

- Logo-URL
- Akzentfarbe
- Footer-Text
- Bewertungs-Links (Google, etc.)

## Architektur

```
Fotograf-Dashboard  →  /dashboard/*
Kunden-Galerie      →  /gallery/[slug]
Login               →  /login
```

**Zwei Nutzer-Typen:**
- **Fotograf** — verwaltet Kunden, Galerien und Uploads
- **Kunde** — betrachtet seine Galerie, markiert Favoriten

## Storage

Das System unterstützt zwei Storage-Modi (über `STORAGE_MODE` ENV-Variable):

| Modus | Beschreibung |
|-------|-------------|
| `local` | Bilder auf lokalem Dateisystem (`./uploads/`) |
| `supabase` | Bilder in Supabase Storage Bucket |

## Galerie-Designs

| Design | Beschreibung |
|--------|-------------|
| GRID | Gleichmäßiges Quadrat-Raster (Apple Photos Style) |
| MASONRY | Pinterest-Style mit variablen Höhen |
| HORIZONTAL | Kinematisches horizontales Scrollen |
| SLIDESHOW | Fullscreen ein Bild nach dem anderen |
| MAGAZINE | Editorial mit großem Hero-Bild |
| POLAROID | Vintage mit leichter Rotation |

## Lizenz

GPLv3 — siehe [LICENSE](LICENSE)

## Contributing

Siehe [CONTRIBUTING.md](CONTRIBUTING.md)
