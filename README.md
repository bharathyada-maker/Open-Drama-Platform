# Open Drama Platform

> **Stories worth discovering.** The dedicated next-generation streaming theater for serialized 5-minute micro-cinema across six emotional channels: **Love, Action, Comedy, Devotional, Nature, and Animals**.

[![Live Global Deployment](https://img.shields.io/badge/Live_Site-Open_Drama_Platform-ff0055?style=for-the-badge&logo=google-chrome&logoColor=white)](https://bharathyada-maker.github.io/Open-Drama-Platform/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-bharathyada--maker%2FOpen--Drama--Platform-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/bharathyada-maker/Open-Drama-Platform)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

---

## 🌐 Live Global Access

The platform is globally deployed and operational on any desktop, tablet, or mobile browser:

### 👉 **[https://bharathyada-maker.github.io/Open-Drama-Platform/](https://bharathyada-maker.github.io/Open-Drama-Platform/)**

*(No localhost required — secure HTTPS edge delivery with zero installation)*.

---

## 🌟 Core Content Architecture: The 6 Segments

Open Drama Platform categorizes content across six emotionally resonant channels, strictly capped at **≤ 5 minutes per episode**:

| Segment | Aesthetic & Theme | Target Runtime | Core Experience |
| :--- | :--- | :--- | :--- |
| **❤️ Love** | Warm rose & violet hues, intimate two-shots | 3–5 min | Electric chemistry, second chances, bittersweet midnight train confessions, and deep relationship arcs. |
| **🔥 Action** | Amber & crimson glows, ticking countdown timers | 3–5 min | High-rise elevator lockdowns, rooftop parkour couriers, rogue dispatcher bomb defusals, and tactical thrillers. |
| **😂 Comedy** | Bright gold & energetic yellow accents | 3–5 min | Workplace satire, passive-aggressive smart home mutinies, absurd CEO elevator pitches, and relatable chaos. |
| **🕉️ Devotional** | Saffron sunrise glows, Vedic chanting, temple chimes | 3–5 min | Dawn rituals on sacred riverbanks, silent mountain meditation quests, twilight Ganga Aarti fire lamps, and sacred calm. |
| **🌿 Nature** | Emerald & cyan wilderness, cinematic drone glides | 3–5 min | Ancient 2,000-year-old redwood fog canopies, glacial mountain cascades, time-lapse desert thunderstorm lightning. |
| **🐾 Animals** | Savanna amber, wildlife telephoto framing | 3–5 min | Serengeti migration river crossings, playful golden retriever puppies in autumn leaves, and humpback whale acoustic calls. |

---

## 🎬 The 5-Minute Micro-Cinema Rule

To maintain high retention and bingeability across episodes, creators on Open Drama Platform follow a structured narrative blueprint:

1. **0:00 – 0:15 (The Immediate Hook):** Zero slow title rolls. Conflict or electric chemistry is established in seconds.
2. **0:15 – 3:00 (Escalation & Complication):** Stakes amplify with rapid-fire dialogue, tactical choreography, or comedic twists.
3. **3:00 – 4:45 (Climax / Payoff):** The emotional confrontation, physical stunt resolution, or comedic reversal lands.
4. **4:45 – 5:00 (The Cliffhanger):** A compelling reveal or unanswered question motivating viewers to advance to the next episode.

---

## 🎮 Player UX & Outside-of-Screen Controls

- **Outside-of-Screen Navigation Dock (Desktop):** Docked outside the 400px player window on the right side (`left-[calc(50%+220px)]`), featuring Previous Video (`^`), real-time episode counter (`4 of 18`), and Next Video (`v`).
- **Keyboard Shortcuts:** Native support for `ArrowUp`, `ArrowDown`, `k` (prev), and `j` (next).
- **Mobile Floating Pill:** Discrete top-left pill (`top-20 left-4`) providing seamless one-tap navigation without obstructing video actions.
- **Cinematic Clean Mode:** 1-click toggle hiding subtitles, creator info, and metadata badges for pure visual immersion.
- **Persistent Audio Volume:** Background soundtrack volume and mute preferences persist seamlessly between video swipes.

---

## 🛠️ Technical Architecture

OpenDrama runs a **Hybrid Database Client Architecture** that allows the platform to function **100% out-of-the-box** globally, while remaining ready for real production backends:
1. **Client-Side Database Simulator:** Works instantly in any browser. Seeds creators, video streams, comments, likes, and watch history persistently via browser `localStorage`.
2. **Supabase Cloud Production Engine:** Connect your Supabase URL and Anon key to route database calls, storage uploads, and user authentications directly to PostgreSQL with Row Level Security (RLS).
3. **Google Gemini AI Pipeline:** Automated audio transcription, thematic keywording, kinetic subtitles, and content safety analysis.

---

## 📂 Repository Structure

```
opendrama/
├── apps/
│   └── web/                   # Vite + React + TypeScript + Tailwind CSS v4 App
│       ├── src/
│       │   ├── components/    # Immersive players, navigation, comments panel
│       │   ├── pages/         # Drama Hub, Home feed, Discover, Studio, Admin
│       │   ├── lib/           # Hybrid DB client, local seeder, Gemini helper
│       │   ├── hooks/         # Authentication and social contexts
│       │   └── types/         # TypeScript schema definitions
├── supabase/
│   ├── migrations/            # Postgres tables, triggers, and RLS policies
│   └── functions/             # Deno Edge Functions for video analysis
├── docs/                      # PRD, Database schemas, and AI pipeline documentation
├── .github/workflows/         # Automated GitHub Pages CI/CD workflow
├── .env.example               # Template for environment variables
└── README.md                  # Project overview & global live access
```

---

## ☁️ Supabase Cloud & AI Setup (Optional)

To connect OpenDrama to your live Supabase cloud workspace:

1. Create a new project in your **Supabase Dashboard**.
2. In the **SQL Editor**, execute `supabase/migrations/20260801000000_init.sql` to initialize all tables and RLS policies.
3. Configure your keys in `apps/web/.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-api-key
   VITE_GEMINI_API_KEY=your-gemini-api-key
   ```

---

## 💻 Developer & Local Contribution Guide

For contributors who want to run or modify the codebase locally:

```bash
# 1. Clone the repository
git clone https://github.com/bharathyada-maker/Open-Drama-Platform.git
cd Open-Drama-Platform/apps/web

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
