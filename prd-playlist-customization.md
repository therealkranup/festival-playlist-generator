# Playlist Customization — PRD

## Overview
Add playlist size controls to FestifyGen so users can generate curated playlists (Top 20, Top 40, or All Songs) from a selectable number of artists (Top 5, Top 10, or All). Currently users get all artists × 5 songs each with no control. This feature gives users fast, curated playlists ranked by song popularity.

## Problem Statement
- **Who:** Festival-goers using FestifyGen to build playlists
- **Current pain:** No control over playlist size. A 75-artist festival generates 375 songs — too many to listen to, slow to generate, and hits YouTube quota limits (~15 videos/day)
- **Cost:** Users must manually delete songs or sit through long generation times. YouTube saving fails partway through due to quota limits.

## Goals & Success Metrics
| Goal | Metric | Target |
|------|--------|--------|
| Faster generation | Time to generate Top 20 playlist | <10s for Top 5 artists |
| Better playlists | Songs ranked by popularity | Most popular songs surface first |
| YouTube compatibility | Playlist fits within quota | Top 20 stays under quota |

## User Stories

### Must Have (P0)
- As a user, I want to select how many artists to include (Top 5, Top 10, All) so I can focus on headliners or get the full experience
- As a user, I want to choose a playlist size (Top 20, Top 40, All Songs) so I get a curated mix of the best songs
- As a user, I want songs ranked by popularity so the best songs appear first

### Should Have (P1)
- As a user, I want to see estimated song count and duration before generating
- As a user, I want the generation to be fast even for large lineups

## Functional Requirements

### FR-1: Artist Count Selector
- Toggle buttons in LineupEditor: [Top 5] [Top 10] [All]
- "Top 5" keeps the first 5 artists (headliners listed first by festivals)
- "Top 10" keeps the first 10
- "All" keeps entire lineup
- Users can still manually add/remove individual artists after selecting a preset
- Default: All

### FR-2: Playlist Size Selector
- Toggle buttons: [Top 20] [Top 40] [All Songs]
- Top 20: Fetches tracks for selected artists, sorts by Spotify popularity, returns top 20
- Top 40: Same but returns top 40
- All Songs: Returns all tracks (up to 10 per artist)
- Default: Top 20

### FR-3: Popularity-Based Sorting
- Fetch up to 10 top tracks per artist from Spotify (current limit is 5)
- Use Spotify's `popularity` field (0-100) to rank all tracks
- Return the top N tracks sorted by popularity descending

### FR-4: Stats Preview
- Show estimated stats before generation: "~20 songs from 5 artists"
- Update dynamically as user changes selections

### FR-5: Performance
- Fetch artists in parallel batches of 5
- Only fetch tracks for selected artist count (not all then filter)

## Technical Constraints
- Spotify top-tracks API returns max 10 tracks per artist
- YouTube free tier quota: ~15-20 search+add operations per day
- Netlify serverless function timeout: 60 seconds

## Out of Scope
- Custom songs-per-artist slider
- Genre filtering
- Popularity threshold configuration
- Spotify streaming count display

## How to Validate
- Search "Copenhell 2026", select Top 5 artists + Top 20 songs → generates exactly 20 songs, sorted by popularity
- Search any festival, select All artists + Top 40 → generates 40 songs max
- Changing artist count updates the preview stats
- Back/forth navigation preserves selections
