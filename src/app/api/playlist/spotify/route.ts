import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createSpotifyPlaylist, getSpotifyUser } from "@/lib/spotify";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const accessToken = session?.accessToken;

  if (!accessToken) {
    return NextResponse.json(
      { error: "Not authenticated with Spotify" },
      { status: 401 }
    );
  }

  try {
    const { name, trackUris } = await req.json();

    if (!name || !Array.isArray(trackUris) || trackUris.length === 0) {
      return NextResponse.json(
        { error: "Provide playlist name and trackUris" },
        { status: 400 }
      );
    }

    const user = await getSpotifyUser(accessToken);
    const result = await createSpotifyPlaylist(
      accessToken,
      user.id,
      name,
      trackUris
    );

    return NextResponse.json({
      success: true,
      playlistUrl: result.playlistUrl,
      playlistId: result.playlistId,
    });
  } catch (err) {
    console.error("Spotify playlist error:", err);
    return NextResponse.json(
      { error: "Failed to create Spotify playlist" },
      { status: 500 }
    );
  }
}
