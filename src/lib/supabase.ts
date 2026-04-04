import { Festival, Track, ArtistResult } from "@/types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

interface SupabaseResponse<T> {
  data: T | null;
  error: string | null;
}

async function supabaseFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<SupabaseResponse<T>> {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return { data: null, error: "Supabase not configured" };
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      ...options,
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: options.method === "POST" ? "return=representation" : "return=minimal",
        ...options.headers,
      },
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`Supabase error: ${res.status} - ${err}`);
      return { data: null, error: err };
    }

    const data = await res.json();
    return { data, error: null };
  } catch (err) {
    console.error("Supabase fetch error:", err);
    return { data: null, error: String(err) };
  }
}

// --- Festival Cache ---

interface CachedFestival {
  id: number;
  name: string;
  year: number;
  location: string | null;
  dates: string | null;
  country: string | null;
  genre: string | null;
  artists: string[];
  search_keys: string[];
}

interface CachedTracks {
  id: number;
  festival_id: number;
  tracks: Track[];
  artist_results: ArtistResult[];
  total_duration_ms: number;
  not_found_artists: string[];
}

/**
 * Search for a cached festival by query string.
 * Uses trigram similarity for fuzzy matching.
 */
export async function findCachedFestival(
  query: string
): Promise<Festival | null> {
  const normalized = query.toLowerCase().trim();

  // First try: exact match on search_keys
  const exactResult = await supabaseFetch<CachedFestival[]>(
    `festivals?search_keys=cs.{${normalized}}&limit=1`
  );

  if (exactResult.data && exactResult.data.length > 0) {
    const f = exactResult.data[0];
    console.log(`Cache HIT (exact): ${f.name} ${f.year}`);
    return {
      name: f.name,
      year: f.year,
      location: f.location || undefined,
      dates: f.dates || undefined,
      artists: f.artists,
    };
  }

  // Second try: fuzzy match on name using trigram similarity
  // Use ilike for partial matching
  const words = normalized.split(/\s+/).filter((w) => w.length > 2);
  if (words.length === 0) return null;

  // Build a query that matches any word in the festival name
  const nameFilter = words
    .map((w) => `name.ilike.*${encodeURIComponent(w)}*`)
    .join(",");

  const fuzzyResult = await supabaseFetch<CachedFestival[]>(
    `festivals?or=(${nameFilter})&order=year.desc&limit=5`
  );

  if (fuzzyResult.data && fuzzyResult.data.length > 0) {
    // Find best match - prefer one that matches the most words
    const scored = fuzzyResult.data.map((f) => {
      const nameLower = f.name.toLowerCase();
      const matchCount = words.filter(
        (w) => nameLower.includes(w) || f.search_keys.some((k) => k.includes(w))
      ).length;
      return { festival: f, score: matchCount };
    });
    scored.sort((a, b) => b.score - a.score);

    if (scored[0].score > 0) {
      const f = scored[0].festival;
      console.log(`Cache HIT (fuzzy): ${f.name} ${f.year} (score: ${scored[0].score})`);
      return {
        name: f.name,
        year: f.year,
        location: f.location || undefined,
        dates: f.dates || undefined,
        artists: f.artists,
      };
    }
  }

  console.log(`Cache MISS: ${query}`);
  return null;
}

/**
 * Get cached tracks for a festival by name and year.
 */
export async function getCachedTracks(
  festivalName: string,
  year: number
): Promise<{
  tracks: Track[];
  artistResults: ArtistResult[];
  totalDurationMs: number;
  notFoundArtists: string[];
} | null> {
  // First find the festival ID
  const festResult = await supabaseFetch<CachedFestival[]>(
    `festivals?name=eq.${encodeURIComponent(festivalName)}&year=eq.${year}&limit=1`
  );

  if (!festResult.data || festResult.data.length === 0) return null;

  const festivalId = festResult.data[0].id;

  // Get cached tracks
  const tracksResult = await supabaseFetch<CachedTracks[]>(
    `festival_tracks?festival_id=eq.${festivalId}&limit=1`
  );

  if (!tracksResult.data || tracksResult.data.length === 0) return null;

  const cached = tracksResult.data[0];
  console.log(`Tracks cache HIT: ${festivalName} ${year} (${cached.tracks.length} tracks)`);

  return {
    tracks: cached.tracks,
    artistResults: cached.artist_results,
    totalDurationMs: cached.total_duration_ms,
    notFoundArtists: cached.not_found_artists,
  };
}

/**
 * Save a festival lineup to cache.
 */
export async function cacheFestival(
  festival: Festival,
  country?: string,
  genre?: string
): Promise<number | null> {
  const searchKeys = generateSearchKeys(festival.name, festival.year);

  const result = await supabaseFetch<CachedFestival[]>(
    "festivals",
    {
      method: "POST",
      headers: { Prefer: "return=representation,resolution=merge-duplicates" },
      body: JSON.stringify({
        name: festival.name,
        year: festival.year,
        location: festival.location || null,
        dates: festival.dates || null,
        country: country || null,
        genre: genre || null,
        artists: festival.artists,
        search_keys: searchKeys,
        updated_at: new Date().toISOString(),
      }),
    }
  );

  if (result.data && result.data.length > 0) {
    console.log(`Cached festival: ${festival.name} ${festival.year} (id: ${result.data[0].id})`);
    return result.data[0].id;
  }
  return null;
}

/**
 * Save tracks for a festival to cache.
 */
export async function cacheTracks(
  festivalId: number,
  tracks: Track[],
  artistResults: ArtistResult[],
  totalDurationMs: number,
  notFoundArtists: string[]
): Promise<boolean> {
  const result = await supabaseFetch(
    "festival_tracks",
    {
      method: "POST",
      headers: { Prefer: "return=minimal,resolution=merge-duplicates" },
      body: JSON.stringify({
        festival_id: festivalId,
        tracks,
        artist_results: artistResults,
        total_duration_ms: totalDurationMs,
        not_found_artists: notFoundArtists,
      }),
    }
  );

  return !result.error;
}

/**
 * Generate search keys for a festival (lowercase variations).
 */
function generateSearchKeys(name: string, year: number): string[] {
  const base = name.toLowerCase().trim();
  const keys = new Set<string>();

  keys.add(base);
  keys.add(`${base} ${year}`);

  // Without "festival" suffix
  const withoutFestival = base.replace(/\s*festival\s*/gi, "").trim();
  if (withoutFestival !== base) {
    keys.add(withoutFestival);
    keys.add(`${withoutFestival} ${year}`);
  }

  // With "festival" suffix if not present
  if (!base.includes("festival")) {
    keys.add(`${base} festival`);
    keys.add(`${base} festival ${year}`);
  }

  // Individual significant words (3+ chars)
  const words = base.split(/\s+/).filter((w) => w.length >= 4);
  words.forEach((w) => keys.add(w));

  return Array.from(keys);
}
