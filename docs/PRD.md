# Product Requirement Document (PRD) - OpenDrama MVP

## 1. Product Vision
OpenDrama is an open-source, community-powered entertainment platform where creators publish original short films and vertical micro-series, and audiences can view, comment, save, and help localize subtitles.

## 2. Core MVP Features
- **Sign Up / Login:** Interactive wizard collecting language preferences and favorite genres.
- **Landing Explore Page:** Structured grids showing "Continue Watching", "Trending Now", "Rising Creators", and browse carousels.
- **Vertical Feed Player:** Swipe-snapped feed mimicking mobile viewing, with like, save, comment drawers, and follow controls.
- **Episode Sequencing:** Dedicated series overview screens displaying season lists, individual progress states, and next episode queues.
- **Creator Dashboard:** Real-time analytics tracking total views/likes and a multi-step upload wizard.
- **AI Enrichment:** Direct client or Edge Function pipeline communicating with Gemini models to auto-suggest titles, synopses, and genres.
- **Moderation Panel:** Queue list exposing copyright claims and inappropriate reports with ban/ignore toggles.

## 3. Viral Discovery Engine
OpenDrama ranks videos dynamically based on Momentum and Freshness decay coefficients rather than raw view count totals:
$$\text{Momentum Score} = 0.3 \times \text{Completion Rate} + 0.2 \times \text{Rewatch Rate} + 0.15 \times \text{Shares} + 0.15 \times \text{Likes} + 0.1 \times \text{Comments} + 0.1 \times \text{Follows}$$

## 4. Rights and Content Policy
Every creator upload requires an active rights declaration check. OpenDrama is intended for creator-owned, public domain, or Creative Commons content. It does not support unauthorized commercial TV or movie distribution.

## 5. Out of Scope for MVP
- Paid creator subscriptions or advertising plans.
- Live stream broadcasting.
- Automated voice dubbing.
