# Adeen — Mobile-First Media Platform

A clean, minimal media platform with gesture-based interactions, built with React + Vite on the frontend and Node.js + Express on the backend.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS v3 |
| Backend | Node.js, Express.js |
| Database | PostgreSQL via Supabase |
| Storage | Cloudflare R2 |
| Frontend hosting | Vercel |
| Backend hosting | Render |

## Project Structure

```
Adeen/
├── frontend/   # React + Vite app
└── backend/    # Express REST API
```

## Getting Started

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
cp .env.example .env
# Fill in SUPABASE_URL, SUPABASE_SERVICE_KEY, R2_* variables
npm install
npm run dev
```

## Database Schema

```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_url TEXT NOT NULL,
  type VARCHAR(10) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

CREATE TABLE interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  likes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  last_seen TIMESTAMPTZ,
  time_viewed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Features

- Mobile-first PWA with gesture support
- Full-screen Reels with pinch zoom
- Debounced search with grid preview
- Drag & drop media upload
- Double-tap to like with heart animation
- Horizontal swipe navigation
- Dark theme
- Cloudflare R2 media storage
- Supabase PostgreSQL
