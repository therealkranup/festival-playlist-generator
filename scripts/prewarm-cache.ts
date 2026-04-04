/**
 * Pre-warm the festival cache.
 *
 * Usage:
 *   npx tsx scripts/prewarm-cache.ts
 *
 * Required env vars:
 *   ANTHROPIC_API_KEY, SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET,
 *   SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL), SUPABASE_SERVICE_KEY
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

// ─── Config ──────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || "";
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || "";
const SPOTIFY_ID = process.env.SPOTIFY_CLIENT_ID || "";
const SPOTIFY_SECRET = process.env.SPOTIFY_CLIENT_SECRET || "";

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY");
  process.exit(1);
}

// ─── Festival list ──────────────────────────────────────────────────
interface FestivalSeed {
  query: string; // Search query for Claude
  name: string; // Canonical name
  year: number;
  country: string;
  genre: string;
}

const FESTIVALS: FestivalSeed[] = [
  // DENMARK
  { query: "Roskilde Festival 2026", name: "Roskilde Festival", year: 2026, country: "Denmark", genre: "All genres" },
  { query: "Copenhell 2026", name: "Copenhell", year: 2026, country: "Denmark", genre: "Metal/Rock" },
  { query: "Smukfest 2026", name: "Smukfest", year: 2026, country: "Denmark", genre: "Pop/Rock/Electronic" },
  { query: "NorthSide Festival 2026 Aarhus", name: "NorthSide", year: 2026, country: "Denmark", genre: "Pop/Rock/Electronic" },
  { query: "Tinderbox Festival 2026 Odense", name: "Tinderbox", year: 2026, country: "Denmark", genre: "Pop/Rock/Hip-hop" },
  { query: "Distortion Copenhagen 2026", name: "Distortion", year: 2026, country: "Denmark", genre: "Electronic" },
  { query: "Heartland Festival 2026 Denmark", name: "Heartland Festival", year: 2026, country: "Denmark", genre: "Culture/Music" },

  // GERMANY
  { query: "Wacken Open Air 2026", name: "Wacken Open Air", year: 2026, country: "Germany", genre: "Metal" },
  { query: "Rock am Ring 2026", name: "Rock am Ring", year: 2026, country: "Germany", genre: "Rock/Metal/Alt" },
  { query: "Rock im Park 2026", name: "Rock im Park", year: 2026, country: "Germany", genre: "Rock/Metal/Alt" },
  { query: "Airbeat One 2026", name: "Airbeat One", year: 2026, country: "Germany", genre: "EDM/Hardstyle" },
  { query: "Splash Festival 2026 Germany", name: "Splash! Festival", year: 2026, country: "Germany", genre: "Hip-hop" },

  // UK
  { query: "Download Festival 2026 Donington", name: "Download Festival", year: 2026, country: "UK", genre: "Metal/Rock" },
  { query: "Reading Festival 2026", name: "Reading Festival", year: 2026, country: "UK", genre: "Rock/Alt/Pop" },
  { query: "Leeds Festival 2026", name: "Leeds Festival", year: 2026, country: "UK", genre: "Rock/Alt/Pop" },
  { query: "Isle of Wight Festival 2026", name: "Isle of Wight Festival", year: 2026, country: "UK", genre: "Pop/Rock" },

  // BELGIUM
  { query: "Tomorrowland 2026", name: "Tomorrowland", year: 2026, country: "Belgium", genre: "EDM" },
  { query: "Pukkelpop 2026", name: "Pukkelpop", year: 2026, country: "Belgium", genre: "Alt/Rock/Electronic" },
  { query: "Graspop Metal Meeting 2026", name: "Graspop Metal Meeting", year: 2026, country: "Belgium", genre: "Metal" },

  // NETHERLANDS
  { query: "Lowlands Festival 2026", name: "Lowlands", year: 2026, country: "Netherlands", genre: "All genres" },
  { query: "Pinkpop Festival 2026", name: "Pinkpop", year: 2026, country: "Netherlands", genre: "Rock/Pop" },
  { query: "Amsterdam Dance Event 2026", name: "Amsterdam Dance Event", year: 2026, country: "Netherlands", genre: "Electronic" },

  // SPAIN
  { query: "Primavera Sound 2026 Barcelona", name: "Primavera Sound", year: 2026, country: "Spain", genre: "Indie/Alt/Pop" },
  { query: "Sonar Festival 2026 Barcelona", name: "Sónar", year: 2026, country: "Spain", genre: "Electronic" },
  { query: "Mad Cool Festival 2026 Madrid", name: "Mad Cool", year: 2026, country: "Spain", genre: "Rock/Pop/Electronic" },

  // FRANCE
  { query: "Hellfest 2026 Clisson", name: "Hellfest", year: 2026, country: "France", genre: "Metal/Rock" },
  { query: "Rock en Seine 2026 Paris", name: "Rock en Seine", year: 2026, country: "France", genre: "Rock/Indie" },

  // SCANDINAVIA (non-DK)
  { query: "Sweden Rock Festival 2026", name: "Sweden Rock Festival", year: 2026, country: "Sweden", genre: "Rock/Metal" },
  { query: "Way Out West 2026 Gothenburg", name: "Way Out West", year: 2026, country: "Sweden", genre: "Indie/Pop/Electronic" },
  { query: "Tons of Rock 2026 Oslo", name: "Tons of Rock", year: 2026, country: "Norway", genre: "Metal/Rock" },
  { query: "Inferno Metal Festival 2026 Oslo", name: "Inferno Metal Festival", year: 2026, country: "Norway", genre: "Metal" },

  // EASTERN EUROPE
  { query: "Sziget Festival 2026 Budapest", name: "Sziget Festival", year: 2026, country: "Hungary", genre: "All genres" },
  { query: "EXIT Festival 2026 Novi Sad", name: "EXIT Festival", year: 2026, country: "Serbia", genre: "Electronic/Rock" },
  { query: "Pol'and'Rock Festival 2026", name: "Pol'and'Rock Festival", year: 2026, country: "Poland", genre: "Rock/All genres" },

  // AUSTRIA/SWITZERLAND
  { query: "Nova Rock 2026 Austria", name: "Nova Rock", year: 2026, country: "Austria", genre: "Rock/Metal" },
  { query: "Paléo Festival 2026 Nyon", name: "Paléo Festival", year: 2026, country: "Switzerland", genre: "All genres" },
];

// ─── Helpers ────────────────────────────────────────────────────────

function generateSearchKeys(name: string, year: number): string[] {
  const base = name.toLowerCase().trim();
  const keys = new Set<string>();
  keys.add(base);
  keys.add(`${base} ${year}`);
  const withoutFestival = base.replace(/\s*festival\s*/gi, "").trim();
  if (withoutFestival !== base) {
    keys.add(withoutFestival);
    keys.add(`${withoutFestival} ${year}`);
  }
  if (!base.includes("festival")) {
    keys.add(`${base} festival`);
    keys.add(`${base} festival ${year}`);
  }
  const words = base.split(/\s+/).filter((w) => w.length >= 4);
  words.forEach((w) => keys.add(w));
  return Array.from(keys);
}

async function supabasePost(table: string, data: Record<string, unknown>) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation,resolution=merge-duplicates",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase ${table} error: ${res.status} - ${err}`);
  }
  return res.json();
}

async function supabaseGet(path: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
  if (!res.ok) return null;
  return res.json();
}

// ─── Claude API: fetch lineup ────────────────────────────────────────

async function fetchLineup(query: string): Promise<{
  name: string;
  year: number;
  location?: string;
  dates?: string;
  artists: string[];
} | null> {
  const prompt = `Find the complete music festival lineup for: "${query}"

Use web search to find the most current and accurate lineup information.

After searching, return ONLY a JSON object (no markdown, no explanation, no code fences) with this exact structure:
{
  "name": "Festival Name",
  "year": 2026,
  "location": "City, Country",
  "dates": "June 17-20",
  "artists": ["Artist 1", "Artist 2", "Artist 3"]
}

Important:
- Include ALL artists/bands in the lineup, not just headliners
- Use the official/common name for each artist
- If you cannot find a real lineup for this festival, return exactly: null
- Return ONLY the JSON, nothing else`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-beta": "web-search-2025-03-05",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 16000,
      tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 5 }],
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    console.error(`Claude API error: ${res.status}`);
    return null;
  }

  const data = await res.json();
  const textBlocks = (data.content || []).filter((b: { type: string }) => b.type === "text");
  const text = textBlocks.length > 0 ? textBlocks[textBlocks.length - 1].text?.trim() : null;
  if (!text || text === "null") return null;

  let jsonStr = text;
  if (jsonStr.startsWith("```")) {
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }
  const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (jsonMatch) jsonStr = jsonMatch[0];

  const parsed = JSON.parse(jsonStr);
  if (!parsed || !Array.isArray(parsed.artists) || parsed.artists.length === 0) return null;

  return {
    name: parsed.name || query,
    year: parsed.year || 2026,
    location: parsed.location,
    dates: parsed.dates,
    artists: parsed.artists,
  };
}

// ─── Spotify API: fetch tracks ────────────────────────────────────────

let spotifyToken: string | null = null;
let spotifyTokenExpiry = 0;

async function getSpotifyToken(): Promise<string> {
  if (spotifyToken && Date.now() < spotifyTokenExpiry) return spotifyToken;
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${SPOTIFY_ID}:${SPOTIFY_SECRET}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });
  const data = await res.json();
  spotifyToken = data.access_token;
  spotifyTokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return spotifyToken!;
}

async function spotifyFetch(path: string) {
  const token = await getSpotifyToken();
  const res = await fetch(`https://api.spotify.com/v1${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 429) {
    const retryAfter = parseInt(res.headers.get("Retry-After") || "3", 10);
    console.log(`  Rate limited, waiting ${retryAfter}s...`);
    await new Promise((r) => setTimeout(r, retryAfter * 1000));
    return spotifyFetch(path);
  }
  if (!res.ok) return null;
  return res.json();
}

interface TrackData {
  id: string;
  name: string;
  artist: string;
  albumName: string;
  albumArt: string;
  previewUrl: string | null;
  spotifyUri: string;
  durationMs: number;
  popularity: number;
}

interface ArtistResultData {
  name: string;
  found: boolean;
  spotifyId?: string;
  imageUrl?: string;
  tracks: TrackData[];
}

async function getArtistTracks(artistName: string): Promise<ArtistResultData> {
  const searchData = await spotifyFetch(
    `/search?q=${encodeURIComponent(artistName)}&type=artist&limit=1`
  );
  const artist = searchData?.artists?.items?.[0];
  if (!artist) return { name: artistName, found: false, tracks: [] };

  const topData = await spotifyFetch(`/artists/${artist.id}/top-tracks?market=US`);
  const tracks: TrackData[] = (topData?.tracks || []).map(
    (t: {
      id: string;
      name: string;
      popularity: number;
      artists: { name: string }[];
      album: { name: string; images: { url: string }[] };
      preview_url: string | null;
      uri: string;
      duration_ms: number;
    }) => ({
      id: t.id,
      name: t.name,
      artist: t.artists[0]?.name || "",
      albumName: t.album.name,
      albumArt: t.album.images?.[0]?.url || "",
      previewUrl: t.preview_url,
      spotifyUri: t.uri,
      durationMs: t.duration_ms,
      popularity: t.popularity ?? 0,
    })
  );

  return {
    name: artist.name,
    found: true,
    spotifyId: artist.id,
    imageUrl: artist.images?.[0]?.url || "",
    tracks,
  };
}

// ─── Main ────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🎵 Pre-warming cache for ${FESTIVALS.length} festivals\n`);

  let successCount = 0;
  let skipCount = 0;
  let failCount = 0;

  for (let i = 0; i < FESTIVALS.length; i++) {
    const fest = FESTIVALS[i];
    console.log(`\n[${i + 1}/${FESTIVALS.length}] ${fest.name} ${fest.year} (${fest.country})`);

    // Check if already cached
    const existing = await supabaseGet(
      `festivals?name=eq.${encodeURIComponent(fest.name)}&year=eq.${fest.year}&limit=1`
    );
    if (existing && existing.length > 0) {
      const tracksExist = await supabaseGet(
        `festival_tracks?festival_id=eq.${existing[0].id}&limit=1`
      );
      if (tracksExist && tracksExist.length > 0) {
        console.log(`  ⏭ Already cached (${existing[0].artists.length} artists, ${tracksExist[0].tracks.length} tracks)`);
        skipCount++;
        continue;
      }
    }

    // Step 1: Fetch lineup via Claude
    console.log(`  🔍 Fetching lineup...`);
    let lineup;
    try {
      lineup = await fetchLineup(fest.query);
    } catch (err) {
      console.error(`  ❌ Lineup fetch failed:`, err);
      failCount++;
      continue;
    }

    if (!lineup || lineup.artists.length === 0) {
      console.log(`  ⚠ No lineup found for ${fest.name}`);
      failCount++;
      continue;
    }

    console.log(`  ✓ Found ${lineup.artists.length} artists`);

    // Step 2: Save festival to Supabase
    const searchKeys = generateSearchKeys(fest.name, fest.year);
    let festivalRow;
    try {
      const rows = await supabasePost("festivals", {
        name: fest.name,
        year: fest.year,
        location: lineup.location || null,
        dates: lineup.dates || null,
        country: fest.country,
        genre: fest.genre,
        artists: lineup.artists,
        search_keys: searchKeys,
      });
      festivalRow = rows[0];
    } catch (err) {
      console.error(`  ❌ Failed to save festival:`, err);
      failCount++;
      continue;
    }

    // Step 3: Fetch tracks for all artists from Spotify
    console.log(`  🎶 Fetching tracks for ${lineup.artists.length} artists...`);
    const artistResults: ArtistResultData[] = [];
    const allTracks: TrackData[] = [];
    let notFound: string[] = [];

    // Fetch in batches of 5 for speed
    for (let j = 0; j < lineup.artists.length; j += 5) {
      const batch = lineup.artists.slice(j, j + 5);
      const results = await Promise.all(batch.map(getArtistTracks));
      artistResults.push(...results);
      for (const r of results) {
        if (r.found) {
          allTracks.push(...r.tracks);
        } else {
          notFound.push(r.name);
        }
      }
      process.stdout.write(`  Progress: ${Math.min(j + 5, lineup.artists.length)}/${lineup.artists.length}\r`);
      // Small delay between batches
      await new Promise((r) => setTimeout(r, 200));
    }

    // Deduplicate
    const seen = new Set<string>();
    const uniqueTracks = allTracks.filter((t) => {
      if (seen.has(t.id)) return false;
      seen.add(t.id);
      return true;
    });
    uniqueTracks.sort((a, b) => b.popularity - a.popularity);

    const totalDurationMs = uniqueTracks.reduce((sum, t) => sum + t.durationMs, 0);

    console.log(`\n  ✓ ${uniqueTracks.length} unique tracks, ${notFound.length} artists not found`);

    // Step 4: Save tracks to Supabase
    try {
      await supabasePost("festival_tracks", {
        festival_id: festivalRow.id,
        tracks: uniqueTracks,
        artist_results: artistResults,
        total_duration_ms: totalDurationMs,
        not_found_artists: notFound,
      });
      console.log(`  ✅ Cached successfully!`);
      successCount++;
    } catch (err) {
      console.error(`  ❌ Failed to save tracks:`, err);
      failCount++;
    }

    // Delay between festivals to avoid rate limits
    await new Promise((r) => setTimeout(r, 1000));
  }

  console.log(`\n${"─".repeat(50)}`);
  console.log(`✅ Done! ${successCount} cached, ${skipCount} skipped, ${failCount} failed`);
  console.log(`Total festivals in cache: ${successCount + skipCount}`);
}

main().catch(console.error);
