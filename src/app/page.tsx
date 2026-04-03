"use client";

import { useState } from "react";
import { Festival, Track, ArtistResult } from "@/types";
import SearchBar from "@/components/SearchBar";
import LineupEditor from "@/components/LineupEditor";
import ManualInput from "@/components/ManualInput";
import PlaylistPreview from "@/components/PlaylistPreview";
import SaveButtons from "@/components/SaveButtons";
import { PlaylistSkeleton, ProgressBar } from "@/components/LoadingSkeleton";

type AppState =
  | "search"
  | "loading-lineup"
  | "lineup"
  | "manual"
  | "loading-tracks"
  | "playlist";

export default function Home() {
  const [state, setState] = useState<AppState>("search");
  const [festival, setFestival] = useState<Festival | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [artistResults, setArtistResults] = useState<ArtistResult[]>([]);
  const [totalDurationMs, setTotalDurationMs] = useState(0);
  const [notFoundArtists, setNotFoundArtists] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  // Step 1: Search for festival lineup
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setState("loading-lineup");

    try {
      const res = await fetch(`/api/lineup?q=${encodeURIComponent(query)}`);
      const data = await res.json();

      if (data.found && data.festival) {
        setFestival(data.festival);
        setState("lineup");
      } else {
        setState("manual");
      }
    } catch {
      setState("manual");
    }
  };

  // Step 2a: Manual lineup submitted
  const handleManualSubmit = (artists: string[]) => {
    const manualFestival: Festival = {
      name: searchQuery || "My Festival",
      year: new Date().getFullYear(),
      artists,
    };
    setFestival(manualFestival);
    setState("lineup");
  };

  // Step 3: Generate playlist from lineup
  const handleGenerate = async (artists: string[]) => {
    setState("loading-tracks");
    setProgress({ done: 0, total: artists.length });

    try {
      const res = await fetch("/api/tracks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artists }),
      });
      const data = await res.json();

      setTracks(data.tracks || []);
      setArtistResults(data.artistResults || []);
      setTotalDurationMs(data.totalDurationMs || 0);
      setNotFoundArtists(data.notFound || []);
      setProgress({ done: artists.length, total: artists.length });
      setState("playlist");
    } catch {
      // On error, go back to lineup editor
      setState("lineup");
    }
  };

  const resetToSearch = () => {
    setState("search");
    setFestival(null);
    setTracks([]);
    setArtistResults([]);
    setNotFoundArtists([]);
    setSearchQuery("");
  };

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full px-6 py-4 flex items-center justify-between">
        <button
          onClick={resetToSearch}
          className="text-white/80 font-bold text-lg hover:text-white transition-colors"
        >
          <span className="text-orange-400">&#9835;</span> FestifyGen
        </button>
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-16">
        {/* Search state */}
        {state === "search" && (
          <div className="w-full max-w-2xl text-center">
            <h1 className="text-5xl sm:text-6xl font-bold text-white mb-3 tracking-tight">
              Which festival are
              <br />
              <span className="bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
                you going to?
              </span>
            </h1>
            <p className="text-white/50 text-lg mb-10">
              We&apos;ll build you a playlist from the full lineup.
            </p>
            <SearchBar onSearch={handleSearch} isLoading={false} />
            <p className="text-white/25 text-xs mt-6">
              Try: Copenhell 2025, Roskilde Festival, Wacken Open Air
            </p>
          </div>
        )}

        {/* Loading lineup */}
        {state === "loading-lineup" && (
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/60">
              Searching for <span className="text-white">{searchQuery}</span> lineup...
            </p>
          </div>
        )}

        {/* Lineup editor */}
        {state === "lineup" && festival && (
          <LineupEditor
            festival={festival}
            onGenerate={handleGenerate}
            onBack={resetToSearch}
            isLoading={false}
          />
        )}

        {/* Manual input */}
        {state === "manual" && (
          <ManualInput
            onSubmit={handleManualSubmit}
            onBack={resetToSearch}
            festivalQuery={searchQuery}
          />
        )}

        {/* Loading tracks */}
        {state === "loading-tracks" && (
          <div>
            <ProgressBar done={progress.done} total={progress.total} />
            <PlaylistSkeleton count={10} />
          </div>
        )}

        {/* Playlist preview */}
        {state === "playlist" && festival && (
          <div className="w-full">
            {/* Festival name header */}
            <div className="text-center mb-8">
              <button
                onClick={() => setState("lineup")}
                className="text-white/50 hover:text-white text-sm mb-3 inline-flex items-center gap-1 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Edit lineup
              </button>
              <h2 className="text-3xl font-bold text-white">{festival.name}</h2>
              {(festival.location || festival.dates) && (
                <p className="text-white/50 mt-1">
                  {[festival.location, festival.dates].filter(Boolean).join(" — ")}
                </p>
              )}
            </div>

            <PlaylistPreview
              tracks={tracks}
              totalDurationMs={totalDurationMs}
              notFoundArtists={notFoundArtists}
              artistCount={artistResults.filter((a) => a.found).length}
            />

            <SaveButtons
              festivalName={festival.name}
              festivalYear={festival.year}
              tracks={tracks}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center text-white/20 text-xs py-6">
        Built with Next.js, Spotify API & YouTube API
      </footer>
    </main>
  );
}
