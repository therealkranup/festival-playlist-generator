"use client";

import { useState, useMemo } from "react";
import { Festival, ArtistPreset, PlaylistSize } from "@/types";

interface LineupEditorProps {
  festival: Festival;
  initialArtists?: string[] | null;
  initialArtistPreset?: ArtistPreset;
  initialPlaylistSize?: PlaylistSize;
  onGenerate: (artists: string[], playlistSize: PlaylistSize) => void;
  onBack: () => void;
  isLoading: boolean;
}

const ARTIST_PRESETS: { value: ArtistPreset; label: string }[] = [
  { value: 5, label: "Top 5" },
  { value: 10, label: "Top 10" },
  { value: "all", label: "All" },
];

const PLAYLIST_SIZES: { value: PlaylistSize; label: string; desc: string }[] = [
  { value: 20, label: "Top 20", desc: "Quick mix" },
  { value: 40, label: "Top 40", desc: "Extended" },
  { value: "all", label: "All Songs", desc: "Full set" },
];

export default function LineupEditor({
  festival,
  initialArtists,
  initialArtistPreset,
  initialPlaylistSize,
  onGenerate,
  onBack,
  isLoading,
}: LineupEditorProps) {
  const allArtists = initialArtists || festival.artists;
  const [artistPreset, setArtistPreset] = useState<ArtistPreset>(initialArtistPreset ?? "all");
  const [playlistSize, setPlaylistSize] = useState<PlaylistSize>(initialPlaylistSize ?? 20);
  const [customArtists, setCustomArtists] = useState<string[]>(allArtists);
  const [isCustom, setIsCustom] = useState(false);
  const [newArtist, setNewArtist] = useState("");

  // Compute the active artist list based on preset or custom selection
  const activeArtists = useMemo(() => {
    if (isCustom) return customArtists;
    if (artistPreset === "all") return allArtists;
    return allArtists.slice(0, artistPreset);
  }, [isCustom, customArtists, artistPreset, allArtists]);

  // Estimate songs count
  const estimatedSongs = useMemo(() => {
    const maxPerArtist = 10; // Spotify returns up to 10
    const totalPossible = activeArtists.length * maxPerArtist;
    if (playlistSize === "all") return `~${totalPossible}`;
    return Math.min(playlistSize, totalPossible).toString();
  }, [activeArtists.length, playlistSize]);

  const handleArtistPreset = (preset: ArtistPreset) => {
    setArtistPreset(preset);
    setIsCustom(false);
  };

  const removeArtist = (index: number) => {
    setCustomArtists((prev) => prev.filter((_, i) => i !== index));
    setIsCustom(true);
  };

  const addArtist = () => {
    const name = newArtist.trim();
    if (name && !customArtists.includes(name)) {
      setCustomArtists((prev) => [...prev, name]);
      setIsCustom(true);
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
      </div>

      {/* Controls panel */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6 space-y-6">
        {/* Artist count */}
        <div>
          <label className="text-white/60 text-sm font-medium mb-3 block">
            How many artists?
          </label>
          <div className="flex gap-2">
            {ARTIST_PRESETS.map((preset) => (
              <button
                key={preset.value}
                onClick={() => handleArtistPreset(preset.value)}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200
                  ${!isCustom && artistPreset === preset.value
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                    : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10"
                  }`}
              >
                {preset.label}
                {preset.value !== "all" && (
                  <span className="text-xs opacity-60 ml-1">artists</span>
                )}
                {preset.value === "all" && (
                  <span className="text-xs opacity-60 ml-1">({allArtists.length})</span>
                )}
              </button>
            ))}
            {isCustom && (
              <button
                className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                disabled
              >
                Custom ({customArtists.length})
              </button>
            )}
          </div>
        </div>

        {/* Playlist size */}
        <div>
          <label className="text-white/60 text-sm font-medium mb-3 block">
            Playlist size
          </label>
          <div className="flex gap-2">
            {PLAYLIST_SIZES.map((size) => (
              <button
                key={size.value}
                onClick={() => setPlaylistSize(size.value)}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200
                  ${playlistSize === size.value
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                    : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10"
                  }`}
              >
                <span className="block">{size.label}</span>
                <span className="block text-xs opacity-60">{size.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Stats preview */}
        <div className="flex items-center justify-between text-sm bg-white/5 rounded-xl px-4 py-3">
          <div className="flex items-center gap-4">
            <span className="text-white/50">
              <span className="text-white font-medium">{activeArtists.length}</span> artists
            </span>
            <span className="text-white/20">·</span>
            <span className="text-white/50">
              <span className="text-white font-medium">~{estimatedSongs}</span> songs
            </span>
          </div>
          {activeArtists.length <= 10 && playlistSize !== "all" && (
            <span className="text-green-400/70 text-xs flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              Fast
            </span>
          )}
        </div>
      </div>

      {/* Artist chips (collapsible) */}
      <details className="mb-6 group" open={isCustom || activeArtists.length <= 15}>
        <summary className="text-white/50 text-sm cursor-pointer hover:text-white transition-colors mb-3 flex items-center gap-1">
          <svg className="w-4 h-4 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          {isCustom ? "Custom lineup" : `Showing ${activeArtists.length} artists`} — click to edit individually
        </summary>

        <div className="flex flex-wrap gap-2 mb-4">
          {activeArtists.map((artist, i) => (
            <span
              key={`${artist}-${i}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full
                         text-white text-sm border border-white/10 group/chip hover:border-red-500/30
                         transition-colors"
            >
              {artist}
              <button
                onClick={() => removeArtist(i)}
                className="text-white/30 group-hover/chip:text-red-400 transition-colors"
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
        <div className="flex gap-2">
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
      </details>

      {/* Generate button */}
      <button
        onClick={() => onGenerate(activeArtists, playlistSize)}
        disabled={activeArtists.length === 0 || isLoading}
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
          `Generate ${playlistSize === "all" ? "All Songs" : `Top ${playlistSize}`} from ${activeArtists.length} Artists`
        )}
      </button>
    </div>
  );
}
