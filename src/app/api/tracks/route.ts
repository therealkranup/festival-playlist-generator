import { NextRequest, NextResponse } from "next/server";
import { batchGetArtistTracks } from "@/lib/spotify";

export const maxDuration = 60; // Allow up to 60s for large lineups

export async function POST(req: NextRequest) {
  try {
    const { artists, playlistSize } = await req.json();

    if (!Array.isArray(artists) || artists.length === 0) {
      return NextResponse.json(
        { error: "Provide an array of artist names" },
        { status: 400 }
      );
    }

    console.log(`Fetching tracks for ${artists.length} artists, playlistSize: ${playlistSize}`);

    // Check Spotify credentials
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

    // Sort by popularity (highest first) for curated playlists
    uniqueTracks.sort((a, b) => b.popularity - a.popularity);

    // Apply playlist size limit
    const limit = typeof playlistSize === "number" ? playlistSize : undefined;
    const finalTracks = limit ? uniqueTracks.slice(0, limit) : uniqueTracks;

    const totalDurationMs = finalTracks.reduce((sum, t) => sum + t.durationMs, 0);
    const notFound = results.filter((r) => !r.found).map((r) => r.name);

    console.log(`Found ${finalTracks.length} tracks (from ${uniqueTracks.length} total), ${notFound.length} artists not found`);

    return NextResponse.json({
      artistResults: results,
      tracks: finalTracks,
      totalDurationMs,
      notFound,
    });
  } catch (err) {
    console.error("Tracks API error:", err);
    return NextResponse.json(
      { error: `Failed to fetch tracks: ${err instanceof Error ? err.message : "unknown"}` },
      { status: 500 }
    );
  }
}
