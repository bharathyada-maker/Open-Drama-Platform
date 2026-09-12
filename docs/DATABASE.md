# Database Schema Guide - OpenDrama

## 1. Entity Relationship Model

OpenDrama tables are structured inside PostgreSQL:

- **Profiles & Creators:** `profiles` (linked to Supabase auth) has a 1-to-1 relationship with `creator_profiles` (stores verify/followers state).
- **Video & Episodes:** `videos` (stores duration, embedding vectors, views/likes/comments counts) joins to `episodes` (links season cards to videos).
- **Shows Playlist:** `series` (stores cover, genre tags) has a 1-to-many relationship with `seasons`, which in turn links to `episodes`.
- **Social Graph:** `likes` (unique user-video pair), `follows` (social link between profiles), `comments` (nesting replies tree).
- **Moderation:** `reports` (safety flags, copyright details) reviewed by admins.

## 2. Postgres Schema Migration

The SQL definition is saved in `supabase/migrations/20260801000000_init.sql`.

### Table Columns Overview
- **embedding vector(768):** Column on the `videos` table containing 768-dimension semantic search tags, optimized for pgvector query processing.
- **is_admin boolean:** Gated user flag inside `profiles` to separate standard users from platform moderators.

## 3. Real-Time Sync Triggers
To optimize select queries, SQL counts are updated instantly via triggers:
- **Likes Sync:** Inserts on `likes` triggers `like_count = like_count + 1` in `videos`.
- **Comments Sync:** Inserts on `comments` increments `comment_count` on `videos`.
- **Followers Sync:** Adds to `follows` increments `followers_count` on `creator_profiles`.

## 4. Row Level Security (RLS) Rules
- **Public access:** Published videos, series, public profiles, and comments are readable by anonymous sessions (`select using (true)`).
- **Creator ownership:** Creators can update/delete only their own videos/series (`using (auth.uid() = creator_id)`).
- **Admin gates:** Gated access to reports list and moderation status updates (`exists (select 1 from profiles where id = auth.uid() and is_admin = true)`).
