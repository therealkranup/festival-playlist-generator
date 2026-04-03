"use client";

import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { Track } from "@/types";

interface SaveButtonsProps {
  festivalName: string;
  festivalYear: number;
  tracks: Track[];
}

type SaveState = "idle" | "saving" | "saved" | "error";

export default function SaveButtons({
  festivalName,
  festivalYear,
  tracks,
}: SaveButtonsProps) {
  const { data: session } = useSession();
  const [spotifyState, setSpotifyState] = useState<SaveState>("idle");
  const [youtubeState, setYoutubeState] = useState<SaveState>("idle");
  const [spotifyUrl, setSpotifyUrl] = useState<string | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState<string | null>(null);
  const [youtubeStats, setYoutubeStats] = useState<{ added: number; skipped: number } | null>(null);
  const [copied, setCopied] = useState(false);

  const playlistName = `${festivalName} ${festivalYear} — Lineup Playlist`;

  const saveToSpotify = async () => {
    const provider = session?.provider;
    if (!session || provider !== "spotify") {
      signIn("spotify");
      return;
    }

    setSpotifyState("saving");
    try {
      const res = await fetch("/api/playlist/spotify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: playlistName,
          trackUris: tracks.map((t) => t.spotifyUri),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSpotifyState("saved");
        setSpotifyUrl(data.playlistUrl);
      } else {
        setSpotifyState("error");
      }
    } catch {
      setSpotifyState("error");
    }
  };

  const saveToYouTube = async () => {
    const provider = session?.provider;
    if (!session || provider !== "google") {
      signIn("google");
      return;
    }

    setYoutubeState("saving");
    try {
      const res = await fetch("/api/playlist/youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: playlistName,
          tracks: tracks.map((t) => ({ name: t.name, artist: t.artist })),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setYoutubeState("saved");
        setYoutubeUrl(data.playlistUrl);
        setYoutubeStats({ added: data.added, skipped: data.skipped?.length || 0 });
      } else {
        setYoutubeState("error");
      }
    } catch {
      setYoutubeState("error");
    }
  };

  const shareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-8 space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Spotify */}
        <button
          onClick={saveToSpotify}
          disabled={spotifyState === "saving" || spotifyState === "saved"}
          className={`flex-1 py-3.5 px-6 rounded-xl font-semibold text-white transition-all duration-200
            flex items-center justify-center gap-2
            ${spotifyState === "saved"
              ? "bg-green-600"
              : spotifyState === "error"
              ? "bg-red-500/80 hover:bg-red-500"
              : "bg-[#1DB954] hover:bg-[#1ed760] shadow-lg shadow-green-500/20"
            } disabled:cursor-not-allowed`}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          {spotifyState === "saved" ? "Saved to Spotify ✓" :
           spotifyState === "saving" ? "Saving..." :
           spotifyState === "error" ? "Retry Spotify" :
           "Save to Spotify"}
        </button>

        {/* YouTube */}
        <button
          onClick={saveToYouTube}
          disabled={youtubeState === "saving" || youtubeState === "saved"}
          className={`flex-1 py-3.5 px-6 rounded-xl font-semibold text-white transition-all duration-200
            flex items-center justify-center gap-2
            ${youtubeState === "saved"
              ? "bg-green-600"
              : youtubeState === "error"
              ? "bg-red-500/80 hover:bg-red-500"
              : "bg-[#FF0000] hover:bg-[#cc0000] shadow-lg shadow-red-500/20"
            } disabled:cursor-not-allowed`}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
          {youtubeState === "saved" ? "Saved to YouTube ✓" :
           youtubeState === "saving" ? "Saving..." :
           youtubeState === "error" ? "Retry YouTube" :
           "Save to YouTube"}
        </button>
      </div>

      {/* Success links */}
      {spotifyUrl && (
        <a
          href={spotifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center text-green-400 hover:text-green-300 text-sm transition-colors"
        >
          Open in Spotify →
        </a>
      )}
      {youtubeUrl && (
        <div className="text-center">
          <a
            href={youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-400 hover:text-red-300 text-sm transition-colors"
          >
            Open in YouTube →
          </a>
          {youtubeStats && youtubeStats.skipped > 0 && (
            <p className="text-white/40 text-xs mt-1">
              {youtubeStats.added} videos added, {youtubeStats.skipped} not found
            </p>
          )}
        </div>
      )}

      {/* Share */}
      <button
        onClick={shareLink}
        className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10
                   text-white/70 text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
          />
        </svg>
        {copied ? "Link copied!" : "Share playlist"}
      </button>
    </div>
  );
}
