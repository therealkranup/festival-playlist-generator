import { NextRequest, NextResponse } from "next/server";
import { batchGetArtistTracks } from "@/lib/spotify";
import { getCachedTracks, cacheTracks, cacheFestival } from "@/lib/supabase";

export const maxDuration = 60; // Allow up to 60s for large lineups

export async function POST(req: NextRequest) {
  try {
    const { artists, playlistSize, festivalName, festivalYear } = await req.json();

    if (!Array.isArray(artists) || artists.length === 0) {
      return NextResponse.json(
        { error: "Provide an array of artist names" },
        { status: 400 }
      );
    }

    console.log(`Fetching tracks for ${artists.length} artists, playlistSize: ${playlistSize}`);

    // 1. Check cache first if festival info is provided
    if (festivalName && festivalYear) {
      const cached = await getCachedTracks(festivalName, festivalYear);
      if (cached) {
        console.log(`Tracks served from cache: ${festivalName} ${festivalYear}`);

        // Sort by popularity and apply limit
        let finalTracks = [...cached.tracks].sort(
          (a, b) => (b.popularity ?? 0) - (a.popularity ?? 0)
        );

        // Filter to only requested artists if subset selected
        if (artists.length < cached.artistResults.length) {
          const artistSet = new Set(artists.map((a: string) => a.toLowerCase()));
          finalTracks = finalTracks.filter((t) =>
            artistSet.has(t.artist.toLowerCase())
          );
        }

        // Apply playlist size limit
        const limit = typeof playlistSize === "number" ? playlistSize : undefined;
        if (limit) finalTracks = finalTracks.slice(0, limit);

        const totalDurationMs = finalTracks.reduce((sum, t) => sum + t.durationMs, 0);

        // Filter artist results to match selected artists
        let filteredArtistResults = cached.artistResults;
        if (artists.length < cached.artistResults.length) {
          const artistSet = new Set(artists.map((a: string) => a.toLowerCase()));
          filteredArtistResults = cached.artistResults.filter((ar) =>
            artistSet.has(ar.name.toLowerCase())
          );
        }

        const notFound = filteredArtistResults
          .filter((r) => !r.found)
          .map((r) => r.name);

        return NextResponse.json({
          artistResults: filteredArtistResults,
          tracks: finalTracks,
          totalDurationMs,
          notFound,
          cached: true,
        });
      }
    }

    // 2. Cache miss — fetch from Spotify
    if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
      console.error("Spotify credentials not set");
      return NextResponse.json(
        { error: "Spotify credentials not configured" },
        { status: 500 }
      );
    }

    const results = await batchGetArtistTracks(artists);

    const allTracks = results.flatMap((r) => r.tracks);
    // Deduplicate by track ID
    const seen = new Set<string>();
    const uniqueTracks = allTracks.filter((t) => {
      if (seen.has(t.id)) return false;
      seen.add(t.id);
      return true;
    });

    // Sort by popularity (highest first)
    uniqueTracks.sort((a, b) => b.popularity - a.popularity);

    // Apply playlist size limit
    const limit = typeof playlistSize === "number" ? playlistSize : undefined;
    const finalTracks = limit ? uniqueTracks.slice(0, limit) : uniqueTracks;

    const totalDurationMs = finalTracks.reduce((sum, t) => sum + t.durationMs, 0);
    const notFound = results.filter((r) => !r.found).map((r) => r.name);

    console.log(`Found ${finalTracks.length} tracks (from ${uniqueTracks.length} total), ${notFound.length} artists not found`);

    // 3. Save to cache for next time (fire and forget)
    if (festivalName && festivalYear) {
      (async () => {
        try {
          const festivalId = await cacheFestival({
            name: festivalName,
            year: festivalYear,
            artists,
          });
          if (festivalId) {
            await cacheTracks(festivalId, uniqueTracks, results, totalDurationMs, notFound);
            console.log(`Cached tracks for: ${festivalName} ${festivalYear}`);
          }
        } catch (err) {
          console.error("Failed to cache tracks:", err);
        }
      })();
    }

    return NextResponse.json({
      artistResults: results,
      tracks: finalTracks,
      totalDurationMs,
      notFound,
      cached: false,
    });
  } catch (err) {
    console.error("Tracks API error:", err);
    return NextResponse.json(
      { error: `Failed to fetch tracks: ${err instanceof Error ? err.message : "unknown"}` },
      { status: 500 }
    );
  }
}
