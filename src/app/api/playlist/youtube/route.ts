import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createYouTubePlaylistFromTracks } from "@/lib/youtube";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const accessToken = session?.accessToken;
  const provider = session?.provider;

  if (!accessToken || provider !== "google") {
    return NextResponse.json(
      { error: "Not authenticated with YouTube" },
      { status: 401 }
    );
  }

  try {
    const { name, tracks } = await req.json();

    if (!name || !Array.isArray(tracks) || tracks.length === 0) {
      return NextResponse.json(
        { error: "Provide playlist name and tracks" },
        { status: 400 }
      );
    }

    const result = await createYouTubePlaylistFromTracks(
      accessToken,
      name,
      tracks
    );

    return NextResponse.json({
      success: true,
      playlistUrl: result.playlistUrl,
      playlistId: result.playlistId,
      added: result.added,
      skipped: result.skipped,
    });
  } catch (err) {
    console.error("YouTube playlist error:", err);
    return NextResponse.json(
      { error: "Failed to create YouTube playlist" },
      { status: 500 }
    );
  }
}
