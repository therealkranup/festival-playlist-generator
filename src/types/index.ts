export interface Festival {
  name: string;
  year: number;
  location?: string;
  dates?: string;
  imageUrl?: string;
  artists: string[];
}

export interface Track {
  id: string;
  name: string;
  artist: string;
  albumName: string;
  albumArt: string;
  previewUrl: string | null;
  spotifyUri: string;
  durationMs: number;
  popularity: number;
}

export type ArtistPreset = 5 | 10 | "all";
export type PlaylistSize = 20 | 40 | "all";

export interface ArtistResult {
  name: string;
  found: boolean;
  spotifyId?: string;
  imageUrl?: string;
  tracks: Track[];
}

export interface PlaylistData {
  festival: Festival;
  artistResults: ArtistResult[];
  tracks: Track[];
  totalDurationMs: number;
  createdAt: string;
}

export interface SaveResult {
  success: boolean;
  playlistUrl?: string;
  playlistId?: string;
  skippedTracks?: string[];
  error?: string;
}
