# OpenDrama

> **Stories worth discovering.** An open-source, community-powered streaming and social discovery platform for short films, vertical micro-series, and creator-owned episodic stories.

OpenDrama is designed as a mobile-first, responsive, and immersive web experience. It features high-quality vertical swipe streams, series/season hierarchies, creator hubs with metrics, moderation logs, and Gemini AI metadata analysis.

---

## Technical Architecture

OpenDrama runs a **Hybrid Database Client Architecture** that allows the platform to function **100% out-of-the-box** without any complex configurations, while remaining fully ready for real production backends:
1. **Local Database Simulator:** If no Supabase environment keys are provided, the app automatically boots into a simulation mode. It seeds 10 creators, 30 videos (linked to free vertical streams), comments, likes, and watch history stored persistently in `localStorage`.
2. **Supabase Production Engine:** By entering your Supabase URL and Anon key, the client seamlessly routes all database calls, storage uploads, and user authentications directly to PostgreSQL, fully respecting Row Level Security (RLS) policies.

---

## Repository Structure

```
opendrama/
├── apps/
│   └── web/                   # Vite React + TypeScript + Tailwind CSS v4 App
│       ├── src/
│       │   ├── components/    # Immersive players, navigation, comments panel
│       │   ├── pages/         # Home feed, discover, studio hub, moderation board
│       │   ├── lib/           # Hybrid db client, local seeder, Gemini helper
│       │   ├── hooks/         # Authentication and social contexts
│       │   └── types/         # TypeScript schema definitions
├── supabase/
│   ├── migrations/            # Postgres table initializers, triggers, and RLS policies
│   └── functions/             # Deno Edge Functions for Gemini visual processing
├── docs/                      # PRD, Database schemas, and AI pipeline documentation
├── .env.example               # Template for environment variables
└── README.md                  # Setup guidelines
```

---

## Local Setup

### Prerequisites
- Node.js (v18+)
- NPM (v9+)

### Installation

1. Clone the repository and navigate to the project directory:
   ```bash
   cd "Content Platform"
   ```

2. Install dependencies:
   ```bash
   cd apps/web
   npm install
   ```

3. Run the development server locally:
   ```bash
   npm run dev
   ```
   Open your browser to `http://localhost:5173` to explore OpenDrama.

---

## Supabase Production Configuration

To deploy OpenDrama to your live Supabase cloud workspace:

1. Create a new project in your **Supabase Dashboard**.
2. Navigate to the **SQL Editor** in Supabase and paste the contents of the database migration file:
   `supabase/migrations/20260801000000_init.sql`
   Run the query to initialize all tables, trigger counts syncing, and RLS policies.
3. Enable the `pgvector` extension in your database settings to support semantic similarity.
4. Copy `.env.example` in the root to `apps/web/.env` and paste your project values:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-api-key
   ```
5. Restart your local Vite server. The client will detect the configuration and connect directly to your live cloud database!

---

## Google Gemini AI Setup

OpenDrama uses the Google Gemini API to analyze creator uploads, generate search tags, timelines, subtitles, and warn flags.

1. Get an API key from **Google AI Studio**.
2. Paste it in your `apps/web/.env` file:
   ```env
   VITE_GEMINI_API_KEY=your-gemini-api-key
   ```
3. When you upload a video in the Create Hub, click **Enrich with Gemini** to trigger live analysis!

---

## Automated Health Diagnostics

OpenDrama contains an automated verification suite verifying:
- Sign Up & Sign In session states.
- Mock database schema updates.
- RLS boundaries (checks that creators cannot alter other creators' videos).
- Comment postings and deletes.
- Recommendation score calculations.

To execute tests, log in as `alex_rivera`, navigate to **Profile**, select the **Developer Tests** tab, and click **Run Diagnostics**.
