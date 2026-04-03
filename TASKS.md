# Festival Playlist Generator — Implementation Tasks

## Phase 1: Foundation & Spotify Core (Week 1)

### Task 1.1 — Project Scaffolding
- [ ] Initialize Next.js 14+ project with App Router and TypeScript
- [ ] Set up Tailwind CSS with a dark-mode-first theme
- [ ] Configure ESLint + Prettier
- [ ] Create `.env.local` template with all required API keys (Spotify, Google/YouTube, Claude)
- [ ] Set up project folder structure: `app/`, `components/`, `lib/`, `types/`
- [ ] Push initial commit to GitHub repo
- **PRD refs:** Tech Stack table
- **Deliverable:** Running `npm run dev` shows a blank Next.js app with dark theme

### Task 1.2 — Spotify OAuth (NextAuth.js)
- [ ] Install and configure NextAuth.js with the Spotify provider
- [ ] Set up OAuth scopes: `playlist-modify-public`, `playlist-modify-private`, `user-read-email`
- [ ] Build a reusable `<LoginButton provider="spotify" />` component
- [ ] Display the logged-in user's Spotify display name + avatar after auth
- [ ] Handle auth errors gracefully (cancelled, denied, network failure)
- **PRD refs:** FR-6
- **Deliverable:** User can log in with Spotify, see their name, and log out

### Task 1.3 — Spotify Top Tracks API
- [ ] Build `lib/spotify.ts` with functions: `searchArtist(name)`, `getTopTracks(artistId, limit)`
- [ ] Handle Spotify client credentials flow (server-side, for public data before user login)
- [ ] Return normalized data: `{ artist, trackName, albumArt, previewUrl, spotifyUri }`
- [ ] Handle edge cases: artist not found, fewer than 3 tracks, no preview URL
- [ ] Add rate-limit-aware batching (batch requests with small delays for 100+ artists)
- **PRD refs:** FR-4, edge cases table
- **Deliverable:** API route `/api/tracks?artists=Metallica,Slayer` returns top tracks JSON

### Task 1.4 — Spotify Playlist Creation
- [ ] Build `lib/spotify-playlist.ts`: `createPlaylist(userId, name, trackUris)`
- [ ] Playlist title format: `[Festival Name] [Year] — Lineup Playlist`
- [ ] Deduplicate tracks by Spotify track ID before creating
- [ ] Handle large playlists (Spotify API limit: 100 tracks per request → batch adds)
- [ ] Return the playlist URL on success
- **PRD refs:** FR-7
- **Deliverable:** Calling the API creates a real playlist in the user's Spotify account

---

## Phase 2: Lineup Detection & Playlist Preview UI (Week 2)

### Task 2.1 — Festival Lineup Auto-Detection
- [ ] Build `lib/lineup.ts`: `fetchLineup(festivalQuery)`
- [ ] Strategy: Use web search API to find the festival's official lineup page
- [ ] Parse the page content using Claude API to extract artist names as a clean array
- [ ] Return structured data: `{ festivalName, year, location, dates, artists[] }`
- [ ] Fallback: if parsing fails, return `null` so the UI can trigger manual input
- [ ] Cache results (in-memory or Vercel KV) to avoid repeated lookups
- **PRD refs:** FR-1, FR-2
- **Deliverable:** `fetchLineup("Copenhell 2026")` returns the real artist list

### Task 2.2 — Manual Artist Input (Fallback)
- [ ] Build a `<ManualLineupInput />` component with a textarea
- [ ] Parse comma-separated or newline-separated artist names
- [ ] Provide placeholder text with example: "Metallica, Slayer, Ghost..."
- [ ] Transition smoothly from "not found" state to manual input (no dead end)
- **PRD refs:** FR-2
- **Deliverable:** User can paste a list of artists and proceed to playlist generation

### Task 2.3 — Lineup Editor UI
- [ ] Build `<LineupEditor artists={[]} />` component
- [ ] Each artist rendered as a removable chip/tag with an × button
- [ ] "Add artist" input field at the bottom with autocomplete (optional P1)
- [ ] Show festival metadata above the lineup: name, location, dates
- [ ] "Generate Playlist" CTA button at the bottom
- **PRD refs:** FR-3
- **Deliverable:** User sees artist chips, can remove/add, and click Generate

### Task 2.4 — Playlist Preview UI
- [ ] Build `<PlaylistPreview tracks={[]} />` component
- [ ] Each row: album art thumbnail (64px), song title, artist name, play button
- [ ] Inline 30-sec audio player (HTML5 `<audio>` element, play/pause toggle)
- [ ] "No preview available" badge for tracks without preview URLs
- [ ] Show total stats at top: "~3h 45min — 127 songs from 38 artists"
- [ ] Loading skeleton while tracks are being fetched (progressive loading)
- [ ] "X artists weren't found on Spotify" warning if some fail
- **PRD refs:** FR-4, FR-5, edge cases
- **Deliverable:** Full playlist preview with working audio previews

---

## Phase 3: YouTube, Sharing & Social (Week 3)

### Task 3.1 — YouTube/Google OAuth
- [ ] Add Google provider to NextAuth.js config
- [ ] Set up OAuth scope: `https://www.googleapis.com/auth/youtube`
- [ ] Build `<LoginButton provider="google" />` (same pattern as Spotify)
- [ ] Display the logged-in user's YouTube channel name
- **PRD refs:** FR-8
- **Deliverable:** User can log in with Google/YouTube

### Task 3.2 — YouTube Playlist Creation
- [ ] Build `lib/youtube.ts`: `searchVideo(songTitle, artistName)`, `createPlaylist(title, videoIds)`
- [ ] Search strategy: query `"[artist] [song] official music video"` to find the best match
- [ ] Create playlist titled `[Festival Name] [Year] — Lineup Playlist`
- [ ] Track which songs couldn't be found → return summary to UI
- [ ] Be quota-conscious: cache video search results, batch carefully
- **PRD refs:** FR-9, YouTube quota open question
- **Deliverable:** Clicking "Save to YouTube" creates a real YouTube playlist

### Task 3.3 — Save Buttons & Success States
- [ ] Build `<SaveButtons />` component below the playlist preview
- [ ] Two buttons: "Save to Spotify" (green), "Save to YouTube" (red)
- [ ] If not logged in → button triggers OAuth first, then auto-saves after return
- [ ] Loading state while playlist is being created
- [ ] Success state: button changes to "Saved ✓" + "Open in Spotify/YouTube" link
- [ ] Error state: toast notification with retry option
- **PRD refs:** FR-6, FR-7, FR-8, FR-9
- **Deliverable:** Full end-to-end save flow for both platforms

### Task 3.4 — Shareable URLs & OpenGraph
- [ ] Design URL scheme: `/playlist/[slug]` (e.g., `/playlist/copenhell-2026`)
- [ ] Store playlist data for sharing (Vercel KV or URL-encoded state)
- [ ] Server-side render the playlist page with full OpenGraph meta tags
- [ ] OG tags: title, description, image (festival poster or generated card)
- [ ] Twitter Card tags for nice previews on Twitter/X too
- [ ] "Share" button that copies the URL to clipboard with toast confirmation
- **PRD refs:** FR-10
- **Deliverable:** Shared links show rich previews on LinkedIn, Twitter, etc.

---

## Phase 4: Polish, Mobile & Deploy (Week 4)

### Task 4.1 — Homepage & Search UX
- [ ] Design the landing page: large search bar, dark theme, festival vibes
- [ ] Headline: "Which festival are you going to?"
- [ ] Search input with typeahead/autocomplete for popular festivals (nice to have)
- [ ] Smooth transition from search → lineup → playlist (no full page reloads)
- [ ] Empty state / first-visit experience
- **Deliverable:** The homepage looks portfolio-worthy and invites interaction

### Task 4.2 — Visual Polish & Animations
- [ ] Consistent dark-mode palette across all pages
- [ ] Loading skeletons for all async states (lineup loading, tracks loading)
- [ ] Subtle transitions: fade-in for cards, slide-up for playlist rows
- [ ] Responsive typography (clamp-based sizing)
- [ ] Toast notifications for success/error states (non-blocking)
- [ ] Favicon + app name in browser tab
- **Deliverable:** The app feels smooth, modern, and complete

### Task 4.3 — Mobile Responsiveness
- [ ] Test and fix layout on iPhone SE (375px), iPhone 14 (390px), iPad (768px)
- [ ] Playlist rows stack properly on mobile (no horizontal overflow)
- [ ] Save buttons are full-width on mobile
- [ ] Audio player works on iOS Safari (autoplay restrictions)
- [ ] Touch targets are at least 44×44px
- **Deliverable:** App looks and works great on mobile

### Task 4.4 — Error Handling & Edge Cases
- [ ] Festival not found → smooth transition to manual input
- [ ] YouTube quota exceeded → clear message + "try Spotify instead"
- [ ] OAuth cancelled → non-blocking banner
- [ ] 100+ artists → progress indicator during song fetching
- [ ] Network errors → retry with exponential backoff
- [ ] Empty lineup (0 artists) → prevent "Generate" button from being clickable
- **PRD refs:** Edge cases table
- **Deliverable:** No dead ends or confusing error states

### Task 4.5 — Deploy to Vercel
- [ ] Connect GitHub repo to Vercel
- [ ] Set environment variables (Spotify, Google, Claude API keys)
- [ ] Configure production OAuth redirect URIs on Spotify + Google dashboards
- [ ] Test full flow on production URL
- [ ] Set up custom domain (if available)
- **Deliverable:** App is live on a public URL, ready to share on LinkedIn

### Task 4.6 — Final QA & Validation
- [ ] Run through all "How to Validate" scenarios from the PRD
- [ ] Test with 3 real festivals (Copenhell, Roskilde, Wacken or similar)
- [ ] Test shareable link on LinkedIn (does the preview look good?)
- [ ] Test on mobile (real device, not just emulator)
- [ ] Check Lighthouse score (aim for 90+ on Performance and Accessibility)
- [ ] Fix any remaining issues
- **Deliverable:** Confidence that the app is ready to show off

---

## Pre-Requisites (Before You Start Coding)

These need to be done manually by you (Anup):

1. **Spotify Developer App** — Create at [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard). Get Client ID + Secret. Set redirect URI.
2. **Google Cloud Project** — Create at [console.cloud.google.com](https://console.cloud.google.com). Enable YouTube Data API v3. Create OAuth credentials. Get Client ID + Secret.
3. **Claude API Key** — Get from [console.anthropic.com](https://console.anthropic.com). For server-side lineup parsing.
4. **GitHub Repo** — Create `festival-playlist-generator` repo on GitHub.
