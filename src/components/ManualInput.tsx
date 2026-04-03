"use client";

import { useState } from "react";

interface ManualInputProps {
  onSubmit: (artists: string[]) => void;
  onBack: () => void;
  festivalQuery: string;
}

export default function ManualInput({ onSubmit, onBack, festivalQuery }: ManualInputProps) {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    const artists = text
      .split(/[,\n]/)
      .map((a) => a.trim())
      .filter(Boolean);
    if (artists.length > 0) onSubmit(artists);
  };

  return (
    <div className="w-full max-w-2xl mx-auto text-center">
      <button
        onClick={onBack}
        className="text-white/50 hover:text-white text-sm mb-4 inline-flex items-center gap-1 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to search
      </button>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
        <div className="text-4xl mb-3">🎸</div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Couldn&apos;t find &ldquo;{festivalQuery}&rdquo; automatically
        </h3>
        <p className="text-white/50 text-sm mb-6">
          No worries — paste the lineup below and we&apos;ll take it from here.
        </p>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={"Metallica, Ghost, Slayer\nJudas Priest\nAmon Amarth, Behemoth\n\n(comma or newline separated)"}
          className="w-full h-40 px-4 py-3 bg-white/5 border border-white/10 rounded-xl
                     text-white placeholder-white/25 text-sm outline-none resize-none
                     focus:border-orange-500/50 transition-colors"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!text.trim()}
        className="px-8 py-3 bg-orange-500 hover:bg-orange-400 disabled:bg-white/10
                   text-white font-semibold rounded-xl transition-colors disabled:cursor-not-allowed"
      >
        Use This Lineup
      </button>
    </div>
  );
}
