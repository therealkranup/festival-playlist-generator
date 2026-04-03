"use client";

import { Track } from "@/types";
import { formatDuration } from "@/lib/utils";
import AudioPlayer from "./AudioPlayer";
import Image from "next/image";

interface PlaylistPreviewProps {
  tracks: Track[];
  totalDurationMs: number;
  notFoundArtists: string[];
  artistCount: number;
}

export default function PlaylistPreview({
  tracks,
  totalDurationMs,
  notFoundArtists,
  artistCount,
}: PlaylistPreviewProps) {
  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Stats bar */}
      <div className="flex items-center justify-between text-sm text-white/50 mb-4 px-1">
        <span>
          ~{formatDuration(totalDurationMs)} — {tracks.length} songs from {artistCount} artists
        </span>
      </div>

      {/* Not found warning */}
      {notFoundArtists.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3 mb-4">
          <p className="text-yellow-300/80 text-sm">
            {notFoundArtists.length} artist{notFoundArtists.length > 1 ? "s" : ""} not found on Spotify:{" "}
            <span className="text-yellow-300/60">
              {notFoundArtists.join(", ")}
            </span>
          </p>
        </div>
      )}

      {/* Track list */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/5">
        {tracks.map((track, i) => (
          <div
            key={track.id}
            className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors group"
          >
            {/* Number */}
            <span className="text-white/20 text-xs w-6 text-right shrink-0">
              {i + 1}
            </span>

            {/* Album art */}
            <div className="w-10 h-10 rounded-md overflow-hidden bg-white/10 shrink-0 relative">
              {track.albumArt ? (
                <Image
                  src={track.albumArt}
                  alt={track.albumName}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/20">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Track info */}
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{track.name}</p>
              <p className="text-white/40 text-xs truncate">{track.artist}</p>
            </div>

            {/* Duration */}
            <span className="text-white/20 text-xs shrink-0 hidden sm:block">
              {formatDuration(track.durationMs)}
            </span>

            {/* Play button */}
            <AudioPlayer previewUrl={track.previewUrl} />
          </div>
        ))}
      </div>
    </div>
  );
}
