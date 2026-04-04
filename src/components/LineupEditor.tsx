"use client";

import { useState } from "react";
import { Festival } from "@/types";

interface LineupEditorProps {
  festival: Festival;
  initialArtists?: string[] | null;
  onGenerate: (artists: string[]) => void;
  onBack: () => void;
  isLoading: boolean;
}

export default function LineupEditor({
  festival,
  initialArtists,
  onGenerate,
  onBack,
  isLoading,
}: LineupEditorProps) {
  // Use initialArtists if provided (preserves edits), otherwise fall back to festival.artists
  const [artists, setArtists] = useState<string[]>(initialArtists || festival.artists);
  const [newArtist, setNewArtist] = useState("");

  const removeArtist = (index: number) => {
    setArtists((prev) => prev.filter((_, i) => i !== index));
  };

  const addArtist = () => {
    const name = newArtist.trim();
    if (name && !artists.includes(name)) {
      setArtists((prev) => [...prev, name]);
      setNewArtist("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addArtist();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Festival header */}
      <div className="text-center mb-8">
        <button
          onClick={onBack}
          className="text-white/50 hover:text-white text-sm mb-4 inline-flex items-center gap-1 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to search
        </button>
        <h2 className="text-3xl font-bold text-white">{festival.name}</h2>
        {(festival.location || festival.dates) && (
          <p className="text-white/60 mt-1">
            {[festival.location, festival.dates].filter(Boolean).join(" — ")}
          </p>
        )}
        <p className="text-white/40 text-sm mt-2">
          {artists.length} artist{artists.length !== 1 ? "s" : ""} in lineup
        </p>
      </div>

      {/* Artist chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {artists.map((artist, i) => (
          <span
            key={`${artist}-${i}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full
                       text-white text-sm border border-white/10 group hover:border-red-500/30
                       transition-colors"
          >
            {artist}
            <button
              onClick={() => removeArtist(i)}
              className="text-white/30 group-hover:text-red-400 transition-colors"
              aria-label={`Remove ${artist}`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}
      </div>

      {/* Add artist input */}
      <div className="flex gap-2 mb-8">
        <input
          type="text"
          value={newArtist}
          onChange={(e) => setNewArtist(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add an artist..."
          className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl
                     text-white placeholder-white/30 text-sm outline-none
                     focus:border-orange-500/50 transition-colors"
        />
        <button
          onClick={addArtist}
          disabled={!newArtist.trim()}
          className="px-4 py-2.5 bg-white/10 hover:bg-white/15 disabled:opacity-30
                     text-white text-sm rounded-xl transition-colors disabled:cursor-not-allowed"
        >
          + Add
        </button>
      </div>

      {/* Generate button */}
      <button
        onClick={() => onGenerate(artists)}
        disabled={artists.length === 0 || isLoading}
        className="w-full py-4 bg-gradient-to-r from-orange-500 to-pink-500
                   hover:from-orange-400 hover:to-pink-400
                   disabled:from-white/10 disabled:to-white/10
                   text-white font-bold text-lg rounded-2xl
                   transition-all duration-300 disabled:cursor-not-allowed
                   shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Generating Playlist...
          </span>
        ) : (
          `Generate Playlist (${artists.length} artists)`
        )}
      </button>
    </div>
  );
}
