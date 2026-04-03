import { NextRequest, NextResponse } from "next/server";
import { batchGetArtistTracks } from "@/lib/spotify";

export async function POST(req: NextRequest) {
  try {
    const { artists } = await req.json();

    if (!Array.isArray(artists) || artists.length === 0) {
      return NextResponse.json(
        { error: "Provide an array of artist names" },
        { status: 400 }
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

    const totalDurationMs = uniqueTracks.reduce((sum, t) => sum + t.durationMs, 0);
    const notFound = results.filter((r) => !r.found).map((r) => r.name);

    return NextResponse.json({
      artistResults: results,
      tracks: uniqueTracks,
      totalDurationMs,
      notFound,
    });
  } catch (err) {
    console.error("Tracks API error:", err);
    return NextResponse.json({ error: "Failed to fetch tracks" }, { status: 500 });
  }
}
