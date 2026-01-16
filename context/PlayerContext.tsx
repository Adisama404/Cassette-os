import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { PlayerContextType, PlaybackState, Playlist, Track, CassetteTheme } from '../types';
import { getPlaylists, savePlaylist, deletePlaylistFromDB } from '../utils/db';

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [playbackState, setPlaybackState] = useState<PlaybackState>(PlaybackState.NO_TAPE);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(0.8);

  // Initialize audio object lazily but synchronously
  const audioRef = useRef<HTMLAudioElement | null>(null);
  if (!audioRef.current) {
    audioRef.current = new Audio();
    audioRef.current.preload = 'metadata';
  }

  const rafRef = useRef<number | null>(null);

  // --- AUDIO HELPER ---

  const cleanupCurrentSrc = () => {
    if (audioRef.current && audioRef.current.src && audioRef.current.src.startsWith('blob:')) {
      URL.revokeObjectURL(audioRef.current.src);
      audioRef.current.removeAttribute('src');
    }
  };

  const loadTrack = (track: Track) => {
    if (!audioRef.current) return;

    // Clean up previous blob URL
    cleanupCurrentSrc();

    if (track.path) {
      // Native Electron Path
      audioRef.current.src = `file://${track.path}`;
      audioRef.current.load();
    } else if (track.fileHandle && track.fileHandle instanceof Blob) {
      // Web File Handle
      try {
        const url = URL.createObjectURL(track.fileHandle);
        audioRef.current.src = url;
        audioRef.current.load();
      } catch (error) {
        console.error("Failed to create Object URL for track:", track.title, error);
      }
    } else {
      console.warn("File handle and Path missing for track:", track.title);
    }
  };

  // --- CONTROLS ---

  const play = async () => {
    if (!currentPlaylist) return;
    if (playbackState === PlaybackState.PLAYING) return;
    if (!audioRef.current) return;

    try {
      // If we are starting from stopped/no_tape, or if src is empty
      if ((playbackState === PlaybackState.NO_TAPE || playbackState === PlaybackState.STOPPED) || !audioRef.current.src) {
        const track = currentPlaylist.tracks[currentTrackIndex];
        // If src is empty or invalid, load the track
        if (track && (!audioRef.current.src || audioRef.current.src === window.location.href)) {
          loadTrack(track);
        }
      }

      await audioRef.current.play();
      setPlaybackState(PlaybackState.PLAYING);
    } catch (e) {
      console.error("Play failed:", e);
      // If play fails (e.g. empty src), ensure state reflects that
      setPlaybackState(PlaybackState.STOPPED);
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setPlaybackState(PlaybackState.PAUSED);
    }
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setPlaybackState(PlaybackState.STOPPED);
    setCurrentTime(0);
  };

  const next = () => {
    if (!currentPlaylist) return;
    let nextIndex = currentTrackIndex + 1;
    if (nextIndex >= currentPlaylist.tracks.length) {
      stop();
      return;
    }
    setCurrentTrackIndex(nextIndex);

    const wasPlaying = playbackState === PlaybackState.PLAYING;
    loadTrack(currentPlaylist.tracks[nextIndex]);

    if (wasPlaying) {
      // Short timeout to ensure load processes
      setTimeout(() => play(), 0);
    } else {
      setPlaybackState(PlaybackState.STOPPED);
    }
  };

  const prev = () => {
    if (!currentPlaylist || !audioRef.current) return;

    if (audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }

    let prevIndex = currentTrackIndex - 1;
    if (prevIndex < 0) prevIndex = 0;

    setCurrentTrackIndex(prevIndex);
    const wasPlaying = playbackState === PlaybackState.PLAYING;
    loadTrack(currentPlaylist.tracks[prevIndex]);

    if (wasPlaying) {
      setTimeout(() => play(), 0);
    } else {
      setPlaybackState(PlaybackState.STOPPED);
    }
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      const t = Math.max(0, Math.min(time, duration));
      audioRef.current.currentTime = t;
      setCurrentTime(t);
    }
  };

  const setVolume = (vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolumeState(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
  };

  const loadPlaylist = (playlist: Playlist) => {
    stop();
    setCurrentPlaylist(playlist);
    setCurrentTrackIndex(0);
    if (playlist.tracks[0]) loadTrack(playlist.tracks[0]);
    setPlaybackState(PlaybackState.STOPPED);
  };

  const eject = () => {
    stop();
    cleanupCurrentSrc();
    setCurrentPlaylist(null);
    setPlaybackState(PlaybackState.NO_TAPE);
  };

  // --- DB OPS ---

  const addPlaylist = async (name: string, files: (File | { path: string; name: string })[], theme: CassetteTheme) => {
    const tracks: Track[] = files.map((file, index) => {
      const fileName = 'path' in file ? file.name : file.name;
      return {
        id: `${Date.now()}-${index}`,
        fileHandle: 'path' in file ? undefined : (file as File),
        path: 'path' in file ? (file as { path: string }).path : undefined,
        fileName: fileName,
        title: fileName.replace(/\.[^/.]+$/, ""),
        artist: 'Unknown Artist',
        duration: 0,
      };
    });

    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name,
      createdAt: Date.now(),
      tracks,
      totalDuration: 0,
      theme,
    };

    await savePlaylist(newPlaylist);
    setPlaylists(prev => [...prev, newPlaylist]);
  };

  const updatePlaylist = async (playlist: Playlist) => {
    await savePlaylist(playlist);
    setPlaylists(prev => prev.map(p => p.id === playlist.id ? playlist : p));
    if (currentPlaylist?.id === playlist.id) {
      setCurrentPlaylist(playlist);
    }
  };

  const deletePlaylist = async (id: string) => {
    await deletePlaylistFromDB(id);
    setPlaylists(prev => prev.filter(p => p.id !== id));
    if (currentPlaylist?.id === id) {
      eject();
    }
  };

  const addTracksToPlaylist = async (playlistId: string, files: (File | { path: string; name: string })[]) => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) return;

    const newTracks: Track[] = files.map((file, index) => {
      const fileName = 'path' in file ? file.name : file.name;
      return {
        id: `${Date.now()}-${index}-${Math.random().toString(36).substr(2, 5)}`,
        fileHandle: 'path' in file ? undefined : (file as File),
        path: 'path' in file ? (file as { path: string }).path : undefined,
        fileName: fileName,
        title: fileName.replace(/\.[^/.]+$/, ""),
        artist: 'Unknown Artist',
        duration: 0,
      };
    });

    const updatedPlaylist = {
      ...playlist,
      tracks: [...playlist.tracks, ...newTracks]
    };

    await savePlaylist(updatedPlaylist);
    setPlaylists(prev => prev.map(p => p.id === playlistId ? updatedPlaylist : p));
    if (currentPlaylist?.id === playlistId) setCurrentPlaylist(updatedPlaylist);
  };

  const removeTrackFromPlaylist = async (playlistId: string, trackId: string) => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) return;

    const updatedPlaylist = {
      ...playlist,
      tracks: playlist.tracks.filter(t => t.id !== trackId)
    };

    await savePlaylist(updatedPlaylist);
    setPlaylists(prev => prev.map(p => p.id === playlistId ? updatedPlaylist : p));
    if (currentPlaylist?.id === playlistId) setCurrentPlaylist(updatedPlaylist);
  };

  // --- EFFECTS ---

  // Ref refs to avoid stale closures in event listeners
  const nextRef = useRef(next);
  useEffect(() => { nextRef.current = next; });

  useEffect(() => {
    // 1. Load Data
    getPlaylists().then(setPlaylists).catch(console.error);

    // 2. Setup Audio Listeners
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;

    const handleEnded = () => nextRef.current();

    const handleError = (e: Event) => {
      const target = e.target as HTMLAudioElement;
      // Ignore AbortError which happens when loading new track while previous is loading
      if (target.error && target.error.code !== target.error.MEDIA_ERR_ABORTED) {
        console.error(`Audio Error: ${target.error.message} (Code: ${target.error.code})`);
        setPlaybackState(PlaybackState.STOPPED);
      }
    };

    const handleDurationChange = () => setDuration(audio.duration || 0);

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('loadedmetadata', handleDurationChange);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('loadedmetadata', handleDurationChange);
    }

    // 3. Electron Media Keys
    if (window.electron) {
      window.electron.onMediaKey((key: 'play-pause' | 'next' | 'prev') => {
        if (key === 'play-pause') {
          if (audioRef.current?.paused) play();
          else pause();
        } else if (key === 'next') {
          next();
        } else if (key === 'prev') {
          prev();
        }
      });
    }

  }, []); // Run once on mount

  // 3. Time Update Loop
  useEffect(() => {
    const updateTime = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
      rafRef.current = requestAnimationFrame(updateTime);
    };

    if (playbackState === PlaybackState.PLAYING) {
      rafRef.current = requestAnimationFrame(updateTime);
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playbackState]);

  // 4. Electron Power Save
  useEffect(() => {
    if (window.electron) {
      window.electron.setPlaybackState(playbackState === PlaybackState.PLAYING);
    }
  }, [playbackState]);

  return (
    <PlayerContext.Provider value={{
      currentPlaylist,
      currentTrackIndex,
      playbackState,
      currentTime,
      duration,
      volume,
      play,
      pause,
      stop,
      next,
      prev,
      seek,
      loadPlaylist,
      eject,
      addPlaylist,
      updatePlaylist,
      deletePlaylist,
      addTracksToPlaylist,
      removeTrackFromPlaylist,
      playlists,
      setVolume
    }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer must be used within PlayerProvider');
  return context;
};