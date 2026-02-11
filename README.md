# Village Historical Walking Tour PWA

A Progressive Web App for self-guided village walking tours with GPS navigation, audio narration, and a full CMS.

## Features

- Interactive map with walking routes and site markers
- GPS-based navigation with distance/direction indicators
- Audio narration for each site
- Image galleries with lightbox view
- Offline support with cached data
- Admin CMS for managing tours and content
- QR code generation for tour URLs
- Mobile-friendly PWA with install prompt

## Tech Stack

- **Frontend**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Maps**: Mapbox GL JS + react-map-gl
- **Database**: Supabase (PostgreSQL)
- **Audio**: Howler.js
- **Offline**: Dexie.js (IndexedDB) + Workbox
- **State**: Zustand

## Setup

### Prerequisites

- Node.js 18+
- A Supabase account
- A Mapbox account

### 1. Clone and Install

```bash
cd village-walking-tour
npm install
```

### 2. Configure Environment

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-side only)
- `NEXT_PUBLIC_MAPBOX_TOKEN` - Mapbox public access token
- `NEXT_PUBLIC_APP_URL` - Your app URL (for QR codes)

### 3. Setup Database

Run the migration in your Supabase SQL editor:

```bash
# Copy contents of supabase/migrations/001_initial_schema.sql
# Run in Supabase SQL Editor
```

Create a storage bucket:
1. Go to Supabase Dashboard > Storage
2. Create a new bucket called `tour-media`
3. Set it to public

### 4. Create Admin User

1. Go to Supabase Dashboard > Authentication > Users
2. Create a new user
3. In SQL Editor, update their role:

```sql
UPDATE user_profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## Project Structure

```
village-walking-tour/
├── src/
│   ├── app/
│   │   ├── (public)/          # Public tour pages
│   │   ├── (admin)/           # Admin CMS
│   │   └── api/               # API routes
│   ├── components/
│   │   ├── map/               # Map components
│   │   ├── audio/             # Audio player
│   │   ├── gallery/           # Image gallery
│   │   ├── admin/             # Admin components
│   │   ├── pwa/               # PWA components
│   │   └── ui/                # UI components
│   ├── hooks/                 # Custom hooks
│   ├── lib/                   # Utilities
│   ├── stores/                # Zustand stores
│   └── types/                 # TypeScript types
├── public/
│   ├── manifest.json          # PWA manifest
│   └── icons/                 # App icons
└── supabase/migrations/       # Database schema
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Manual Build

```bash
npm run build
npm start
```

## Creating PWA Icons

Replace the placeholder icon with your own. Generate all sizes using a tool like:
- [PWA Asset Generator](https://github.com/nicehash/pwa-asset-generator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)

Required sizes: 72, 96, 128, 144, 152, 192, 384, 512px

## License

MIT
