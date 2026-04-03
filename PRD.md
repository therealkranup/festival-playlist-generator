# Festival Playlist Generator

## Overview

A web app that turns a music festival name into a ready-to-play playlist. You type in "Copenhell 2026," the app finds the lineup, pulls the top songs from every artist on the bill, and lets you save the result straight to Spotify and YouTube with one click. Built as a polished portfolio piece designed to be shareable on LinkedIn and impressive to try out.

## Problem Statement

You're going to a festival with 40+ bands — half of which you've never heard of. Right now, your options are: manually search each artist on Spotify, listen to a few tracks, and hope you remember who you liked. Or just show up blind and hope for the best.

This costs festival-goers roughly 2–4 hours of manual searching and playlist-building per festival. Most people don't bother, which means they miss acts they'd love and over-index on the 3 headliners they already know.

Existing solutions like Spotify's "festival mode" (when available) are limited to specific partnerships and don't cross-post to YouTube. There's no simple, universal tool that says: "Give me the festival name, I'll handle the rest."

## Goals & Success Metrics

| Goal | Metric | Target |
|------|--------|--------|
| Demonstrate technical skill on LinkedIn | Post engagement (likes, comments, shares) | 50+ engagements on launch post |
| Deliver a smooth end-to-end experience | Time from entering festival name to playlist saved | < 60 seconds |
| Make the app feel complete and polished | Users who preview a playlist go on to save it | > 40% conversion |
| Support real festival lineups | Lineup auto-detection success rate | > 70% of major festivals |

## User Stories

### Must Have (P0)

- As a festival-goer, I want to type in a festival name and get a playlist of top songs from every artist on the lineup, so I can discover new music before the event.
- As a user, I want to preview the generated playlist (with album art, song names, and 30-second audio previews) without logging in, so I can see the value before committing.
- As a Spotify user, I want to save the generated playlist to my Spotify account with one click, so I can listen on the go.
- As a YouTube user, I want to save the generated playlist to my YouTube account with one click, so I can watch music videos of the lineup.
- As a user, I want to manually enter or edit the artist list if auto-detection doesn't find my festival, so the app still works for any event.

### Should Have (P1)

- As a user, I want to see the festival date, location, and a poster/image alongside the playlist, so the experience feels context-rich.
- As a user, I want to share a link to my generated playlist page so others can preview and save it too.
- As a user, I want to remove specific artists from the lineup before generating, so I can skip artists I already know well.

### Nice to Have (P2)

- As a user, I want to reorder artists by set time or popularity to customize the playlist flow.
- As a user, I want to see which songs are the "fan favorites" vs "latest releases" so I can choose a playlist style.
- As a returning user, I want to see my previously generated playlists.

## Functional Requirements

### Festival Lookup

- **FR-1**: The app accepts a text query (e.g., "Copenhell 2026", "Roskilde Festival") and searches for the matching event lineup.
  - Acceptance criteria: Given a well-known festival name and year, the app returns the correct artist lineup within 5 seconds.
- **FR-2**: If no lineup is found automatically, the app prompts the user to enter artist names manually (comma-separated or one per line).
  - Acceptance criteria: The manual input mode is presented clearly with a text area and example placeholder text.
- **FR-3**: The user can edit the auto-detected lineup before generating (add/remove artists).
  - Acceptance criteria: Each artist appears as a removable chip/tag, and there's an "add artist" input field.

### Song Discovery

- **FR-4**: For each artist in the lineup, the app fetches their top 3–5 songs using the Spotify API.
  - Acceptance criteria: Each artist contributes 3–5 tracks. If an artist has fewer than 3 tracks on Spotify, all available tracks are included.
- **FR-5**: The playlist preview displays: song title, artist name, album artwork, and a 30-second audio preview (using Spotify's preview URLs).
  - Acceptance criteria: Clicking a song plays a 30-second clip inline without navigating away.

### Playlist Creation — Spotify

- **FR-6**: The user can authenticate with Spotify via OAuth 2.0 (PKCE flow).
  - Acceptance criteria: The OAuth flow opens in a popup/redirect, returns to the app, and the user's Spotify display name is shown.
- **FR-7**: On clicking "Save to Spotify," the app creates a new public playlist on the user's account titled "[Festival Name] [Year] — Lineup Playlist" and adds all songs.
  - Acceptance criteria: The playlist appears in the user's Spotify library within 10 seconds. A success message includes a direct link to the playlist.

### Playlist Creation — YouTube

- **FR-8**: The user can authenticate with YouTube/Google via OAuth 2.0.
  - Acceptance criteria: Same UX pattern as Spotify auth — popup/redirect, display name shown.
- **FR-9**: On clicking "Save to YouTube," the app searches for the official music video of each song and creates a YouTube playlist titled "[Festival Name] [Year] — Lineup Playlist."
  - Acceptance criteria: The playlist is created on the user's YouTube account. Songs without a clear video match are skipped (with a note to the user about which ones were skipped).

### Sharing

- **FR-10**: Each generated playlist has a unique shareable URL (e.g., `/playlist/copenhell-2026`).
  - Acceptance criteria: The URL loads the playlist preview for anyone, without requiring login. OpenGraph meta tags are set so the link previews nicely on LinkedIn/Twitter/etc.

## Non-Functional Requirements

- **Performance**: The full flow (search → lineup → songs → preview) should complete in under 10 seconds for a typical 30-artist festival. Use loading skeletons to keep the UI responsive during API calls.
- **Responsive design**: The app must look great on desktop and mobile. The LinkedIn audience will often open links on their phone.
- **Visual polish**: Modern, clean UI. Smooth animations, good typography, dark-mode-friendly palette (festivals = nighttime vibes). This is a portfolio piece — first impressions matter.
- **SEO & social sharing**: Server-side rendered or statically generated pages with proper OpenGraph tags, so shared links look great on LinkedIn.

## Technical Constraints & Dependencies

### APIs

| Service | Purpose | Auth | Key Limitation |
|---------|---------|------|----------------|
| **Spotify Web API** | Top tracks per artist, audio previews, playlist creation | OAuth 2.0 (PKCE) | Rate limit: ~180 requests/min. 30-sec preview URLs may not be available for all tracks. |
| **YouTube Data API v3** | Video search, playlist creation | OAuth 2.0 | Quota: 10,000 units/day (search = 100 units each). Must be careful with search volume. |
| **Lineup source** | Festival lineup auto-detection | Varies | Options: scrape festival websites, use Setlist.fm API, Bandsintown API, or MusicBrainz. Recommend starting with web search + Claude API for parsing lineup pages. |

### Recommended Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Framework | **Next.js 14+ (App Router)** | Full-stack React, SSR for SEO/social sharing, API routes for backend logic |
| Styling | **Tailwind CSS** | Fast iteration, consistent design, dark mode support built-in |
| Auth | **NextAuth.js** | Built-in Spotify and Google/YouTube OAuth providers |
| Hosting | **Vercel** | Zero-config deployment for Next.js, generous free tier, great for portfolio |
| Database | **None for v1** | Store playlists in URL-encoded state or use Vercel KV if persistence is needed |
| Lineup detection | **Claude API + web search** | Use Claude to parse festival lineup pages found via web search |

### API Credential Setup (Guide)

**Spotify:**
1. Go to [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
2. Create a new app. Set the redirect URI to `http://localhost:3000/api/auth/callback/spotify` (and your production URL later).
3. Note the Client ID and Client Secret.
4. Required scopes: `playlist-modify-public`, `playlist-modify-private`, `user-read-email`.

**YouTube / Google:**
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project. Enable the "YouTube Data API v3."
3. Create OAuth 2.0 credentials (web application type). Set the redirect URI to `http://localhost:3000/api/auth/callback/google`.
4. Note the Client ID and Client Secret.
5. Required scope: `https://www.googleapis.com/auth/youtube`.

**Claude API (for lineup parsing):**
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an API key.
3. This is used server-side only — never exposed to the browser.

## Out of Scope (v1)

- User accounts / persistent user profiles (no signup — just OAuth for Spotify/YouTube)
- Apple Music integration
- Setlist-based playlists (e.g., "what they actually played" after the festival)
- Social features (following other users, collaborative playlists)
- Payment / monetization
- Native mobile app
- Non-music events (comedy festivals, conferences, etc.)
- Playlist customization beyond removing artists (no drag-to-reorder, no genre filtering)

## Edge Cases & Error Handling

| Scenario | Handling |
|----------|----------|
| Festival not found via auto-lookup | Show a friendly message: "Couldn't find that lineup automatically." Offer manual input with a smooth transition — no dead end. |
| Artist not found on Spotify | Skip the artist, show a note: "3 artists weren't found on Spotify" with their names listed. |
| Spotify preview URL not available | Show the song in the list but with a "No preview available" badge instead of a play button. |
| YouTube video not found for a song | Skip the song in the YouTube playlist. Show a summary: "42 of 45 songs added — 3 videos not found." |
| YouTube API quota exceeded | Show a clear error: "YouTube's daily limit reached. Try again tomorrow or save to Spotify instead." |
| OAuth flow cancelled / fails | Return to the playlist preview with a non-intrusive banner: "Login cancelled. You can try again anytime." |
| User has no Spotify/YouTube account | The "Save to Spotify/YouTube" buttons are visible but clicking opens OAuth — if they don't have an account, the OAuth provider handles that flow. |
| Festival has 100+ artists | Paginate or batch API calls. Show a progress indicator: "Loading songs... 45 of 112 artists done." |
| Duplicate songs (artist on multiple stages/days) | Deduplicate by Spotify track ID before creating the playlist. |

## How to Validate

- **FR-1**: Search for "Copenhell 2026" — verify the correct lineup loads with real artist names.
- **FR-2**: Search for a made-up festival ("Fake Fest 2026") — verify the manual input prompt appears.
- **FR-4/FR-5**: Generate a playlist for a known festival — verify each artist has 3–5 songs, album art displays, and audio previews play.
- **FR-6/FR-7**: Log into Spotify, click "Save to Spotify" — verify the playlist appears in your Spotify library with the correct title and all expected songs.
- **FR-8/FR-9**: Log into YouTube, click "Save to YouTube" — verify the playlist appears on your YouTube account.
- **FR-10**: Copy the shareable URL, open it in an incognito window — verify the playlist preview loads without login. Paste the URL into LinkedIn's post composer — verify the link preview shows the festival name and image.
- **Visual**: Open the app on an iPhone (or mobile emulator) — verify the layout is responsive and nothing overlaps or breaks.

## Open Questions

1. **Lineup data source**: What's the most reliable free source for festival lineups? Candidates: Bandsintown API, Setlist.fm, Music Festival Wizard, or direct web scraping + AI parsing. Needs research during implementation.
2. **Spotify rate limits**: With 100+ artists × 5 songs = 500+ API calls per playlist — will we hit rate limits? May need to batch with delays.
3. **YouTube quota**: At 100 search units per query, a 50-artist playlist = 5,000 units out of 10,000/day. Should we cache video search results to reduce quota usage?
4. **Spotify preview availability**: What percentage of tracks have 30-second preview URLs? If it's low, we may need a fallback (e.g., YouTube embed for preview instead).
5. **Deployment domain**: What domain will this live on? Needed for OAuth redirect URIs.

## Appendix

### Interaction Example — Happy Path

```
1. User lands on the homepage. Sees a clean, dark-themed UI with a large
   search bar: "Which festival are you going to?"

2. User types: "Copenhell 2026" and hits Enter.

3. Loading state: A skeleton UI shows while the app searches for the lineup.
   After ~3 seconds, the lineup appears.

4. Lineup screen: Shows "Copenhell 2026 — Copenhagen, Denmark — June 17-20"
   with a grid of artist cards (name + small image). Each card has an × to
   remove. An "Add artist" button sits at the bottom.

5. User removes one artist they don't care about, then clicks
   "Generate Playlist."

6. Playlist preview: Songs load progressively (skeleton → real data).
   Each row shows: album art thumbnail, song title, artist name, and
   a play button for the 30-sec preview. The total playlist duration is
   shown at the top ("~3h 45min — 127 songs").

7. Below the playlist, two prominent buttons:
   "Save to Spotify" and "Save to YouTube"
   Plus a "Share" button that copies the URL.

8. User clicks "Save to Spotify." A Spotify OAuth popup appears.
   User logs in, grants permission. Popup closes.

9. Success state: A green toast appears: "Playlist saved to Spotify!"
   with a "Open in Spotify" link. The button changes to "Saved".

10. User copies the share link and posts it on LinkedIn with a caption
    about getting ready for Copenhell.
```

### Competitive Landscape

| Tool | What it does | Where it falls short |
|------|-------------|---------------------|
| Spotify "Festival Mode" | Shows lineup for partnered festivals | Only works for Spotify-partnered events. No YouTube. Not available for most festivals. |
| Festify | Generates Spotify playlists from festival lineups | Limited festival database. No YouTube. UI feels dated. |
| Setlist.fm | Tracks actual setlists after concerts | Backward-looking (what was played), not forward-looking (what to listen to). No playlist generation. |
| Manual Spotify search | User searches each artist individually | Takes 2–4 hours for a big festival. Tedious. Most people give up after 10 artists. |

### Implementation Sketch

| Phase | Scope | Estimated Time |
|-------|-------|---------------|
| Week 1 | Project setup, Spotify OAuth, top-tracks API, basic playlist generation | 5–7 days |
| Week 2 | Festival lineup lookup (web search + AI parsing), manual input fallback, playlist preview UI | 5–7 days |
| Week 3 | YouTube OAuth + playlist creation, shareable URLs with SSR, OpenGraph tags | 5–7 days |
| Week 4 | Visual polish, mobile responsiveness, edge case handling, deploy to Vercel | 5–7 days |
