# EventBooking

A full-stack event management app — create events, RSVP instantly, and get confirmation emails. Built with Next.js 16, Prisma, NextAuth, and Resend.

## Features

- **Browse & discover** — public event feed with capacity indicators and cover photos
- **RSVP with email confirmation** — one click, instant confirmation email via Resend
- **Waitlist** — events automatically waitlist guests when full; promotes the next person if a spot opens
- **Private events** — toggle an event to private and share it via a secret invite link
- **Full CRUD** — create, edit, and delete your own events
- **Auth** — email/password sign-up and sign-in via NextAuth.js v5
- **Browse tabs** — Public Events · Upcoming RSVPs · Past Attended · My Events
- **Dashboard** — manage your hosted events and see your RSVP history

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router) |
| Database | PostgreSQL + Prisma v6 |
| Auth | NextAuth.js v5 (credentials, JWT sessions) |
| Email | Resend |
| Styling | Tailwind CSS + Lucide icons |

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://your-user@localhost:5432/eventbooking"

AUTH_SECRET="run: openssl rand -base64 32"
AUTH_URL="http://localhost:3000"

RESEND_API_KEY="re_xxxxxxxxxxxxxxxx"
RESEND_FROM_EMAIL="noreply@yourdomain.com"
```

### 3. Set up the database

```bash
# Create the database
createdb eventbooking

# Run migrations
npx prisma migrate deploy

# (Optional) Seed with sample data
npx tsx prisma/seed.ts
```

Seed credentials (if you ran the seed):

| Email | Password |
|---|---|
| alice@example.com | password123 |
| bob@example.com | password123 |
| cara@example.com | password123 |

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Browse page with tabs
│   ├── dashboard/                # User dashboard
│   ├── auth/login/               # Sign in
│   ├── auth/register/            # Sign up
│   ├── events/new/               # Create event
│   ├── events/[id]/              # Event detail + RSVP
│   ├── events/[id]/edit/         # Edit event
│   ├── invite/[token]/           # Private event invite redirect
│   └── api/
│       ├── auth/[...nextauth]/   # NextAuth handler
│       ├── register/             # POST: create account
│       ├── events/               # GET (list) · POST (create)
│       ├── events/[id]/          # GET · PATCH · DELETE
│       └── rsvp/                 # POST (RSVP) · DELETE (cancel)
├── components/
│   ├── Navbar.tsx
│   ├── Providers.tsx
│   ├── BrowseTabs.tsx
│   ├── EventCard.tsx
│   ├── EventCover.tsx            # Deterministic SVG cover art
│   ├── EventForm.tsx
│   ├── RSVPButton.tsx
│   └── ShareLink.tsx
└── lib/
    ├── auth.ts                   # NextAuth config
    ├── prisma.ts                 # PrismaClient singleton
    └── email.ts                  # Resend helpers
```

## API Reference

### Events

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/events` | — | List public upcoming events |
| `POST` | `/api/events` | Required | Create an event |
| `GET` | `/api/events/:id` | — | Get event (token required if private) |
| `PATCH` | `/api/events/:id` | Organizer | Update event |
| `DELETE` | `/api/events/:id` | Organizer | Delete event |

### RSVPs

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/rsvp` | Required | RSVP (or join waitlist if full) |
| `DELETE` | `/api/rsvp` | Required | Cancel RSVP (auto-promotes waitlisted) |

### Auth

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/register` | Create account |
| `GET/POST` | `/api/auth/[...nextauth]` | NextAuth handler |

## Private Events

When an event is set to private:

- It's hidden from the public browse feed
- Only the organizer, confirmed attendees, or holders of the share token can view it
- The organizer sees a shareable invite link on the event detail page
- The link format is `/invite/[token]` which redirects to the event with the token in the query string
