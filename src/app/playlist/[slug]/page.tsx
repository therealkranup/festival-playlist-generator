"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Track } from "@/types";
import { formatDuration } from "@/lib/utils";
import PlaylistPreview from "@/components/PlaylistPreview";
import SaveButtons from "@/components/SaveButtons";
import Link from "next/link";

interface SharedPlaylistData {
  festivalName: string;
  festivalYear: number;
  location?: string;
  dates?: string;
  tracks: Track[];
  artistCount: number;
  totalDurationMs: number;
  notFoundArtists: string[];
}

export default function SharedPlaylistPage() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<SharedPlaylistData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Decode playlist data from URL search params
    const encoded = searchParams.get("d");
    if (encoded) {
      try {
        const decoded = JSON.parse(atob(encoded));
        setData(decoded);
      } catch {
        setError(true);
      }
    } else {
      setError(true);
    }
  }, [searchParams]);

  if (error) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Playlist not found</h1>
          <p className="text-white/50 mb-8">
            This link may have expired or is invalid.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-400
                       text-white font-semibold rounded-xl transition-colors"
          >
            <span className="text-lg">&#9835;</span>
            Create your own playlist
          </Link>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="text-white/80 font-bold text-lg hover:text-white transition-colors"
        >
          <span className="text-orange-400">&#9835;</span> FestifyGen
        </Link>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center px-4 pb-16 pt-8">
        {/* Festival header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/20
                          rounded-full text-orange-400 text-xs font-medium mb-4">
            <span>&#9835;</span> Shared Playlist
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">{data.festivalName}</h1>
          {(data.location || data.dates) && (
            <p className="text-white/50">
              {[data.location, data.dates].filter(Boolean).join(" — ")}
            </p>
          )}
          <p className="text-white/30 text-sm mt-2">
            {data.tracks.length} songs · {formatDuration(data.totalDurationMs)}
          </p>
        </div>

        <PlaylistPreview
          tracks={data.tracks}
          totalDurationMs={data.totalDurationMs}
          notFoundArtists={data.notFoundArtists}
          artistCount={data.artistCount}
        />

        <SaveButtons
          festivalName={data.festivalName}
          festivalYear={data.festivalYear}
          tracks={data.tracks}
        />

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-white/30 text-sm mb-3">Going to a festival?</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10
                       border border-white/10 text-white font-medium rounded-xl transition-colors"
          >
            Create your own playlist
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-white/20 text-xs py-6">
        Built with Next.js, Spotify API & YouTube API
      </footer>
    </main>
  );
}
