export type CassetteTheme = 'black' | 'white' | 'orange' | 'blue' | 'gold' | 'sticker' | 'caution' | 'neon';

export interface Track {
  id: string;
  fileHandle?: File; // For transient local access (Web)
  path?: string; // For persistent local access (Electron)
  fileName: string;
  title: string;
  artist: string;
  duration: number;
}

export interface Playlist {
  id: string;
  name: string;
  createdAt: number;
  tracks: Track[];
  coverColor?: string;
  theme: CassetteTheme;
  totalDuration: number;
  font?: 'sans' | 'hand' | 'marker' | 'typewriter' | 'pencil';
}

export enum PlaybackState {
  STOPPED = 'STOPPED',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  REWINDING = 'REWINDING',
  FAST_FORWARDING = 'FAST_FORWARDING',
  NO_TAPE = 'NO_TAPE',
}

export interface PlayerState {
  currentPlaylist: Playlist | null;
  currentTrackIndex: number;
  playbackState: PlaybackState;
  currentTime: number;
  duration: number;
  volume: number;
}

export interface PlayerContextType extends PlayerState {
  play: () => void;
  pause: () => void;
  stop: () => void;
  next: () => void;
  prev: () => void;
  seek: (time: number) => void;
  loadPlaylist: (playlist: Playlist, startIndex?: number, autoPlay?: boolean) => void;
  eject: () => void;
  addPlaylist: (name: string, files: (File | { path: string; name: string })[], theme: CassetteTheme) => Promise<void>;
  updatePlaylist: (playlist: Playlist) => Promise<void>;
  deletePlaylist: (id: string) => void;
  addTracksToPlaylist: (playlistId: string, files: (File | { path: string; name: string })[]) => Promise<void>;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => Promise<void>;
  playlists: Playlist[];
  setVolume: (vol: number) => void;
  playTrack: (index: number) => void;
  isShuffled: boolean;
  toggleShuffle: () => void;
  reorderTrack: (playlistId: string, fromIndex: number, toIndex: number) => Promise<void>;
}
