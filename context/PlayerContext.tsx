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
  const [isShuffled, setIsShuffled] = useState<boolean>(false);

  // Initialize audio object lazily but synchronously
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ... (keeping existing audio init)
  if (!audioRef.current) {
    audioRef.current = new Audio();
    audioRef.current.preload = 'metadata';
  }

  const rafRef = useRef<number | null>(null);

  // --- AUDIO HELPER ---
  // ... (keep cleanupCurrentSrc and loadTrack same as before)

  const cleanupCurrentSrc = () => {
    if (audioRef.current && audioRef.current.src && audioRef.current.src.startsWith('blob:')) {
      URL.revokeObjectURL(audioRef.current.src);
      audioRef.current.removeAttribute('src');
    }
  };

  const loadTrack = (track: Track) => {
    if (!audioRef.current) return;
    cleanupCurrentSrc();
    if (track.path) {
      audioRef.current.src = `file://${track.path}`;
      audioRef.current.load();
    } else if (track.fileHandle && track.fileHandle instanceof Blob) {
      try {
        const url = URL.createObjectURL(track.fileHandle);
        audioRef.current.src = url;
        audioRef.current.load();
      } catch (error) {
        console.error("Failed", error);
      }
    } else {
      console.warn("Missing file info");
    }
  };


  // --- CONTROLS ---

  const toggleShuffle = () => setIsShuffled(prev => !prev);

  const play = async () => {
    // ... existing play implementation
    if (!currentPlaylist) return;
    if (playbackState === PlaybackState.PLAYING && !audioRef.current?.paused) return;
    if (!audioRef.current) return;

    try {
      if ((playbackState === PlaybackState.NO_TAPE || playbackState === PlaybackState.STOPPED) || !audioRef.current.src) {
        const track = currentPlaylist.tracks[currentTrackIndex];
        if (track && (!audioRef.current.src || audioRef.current.src === window.location.href)) {
          loadTrack(track);
        }
      }
      await audioRef.current.play();
      setPlaybackState(PlaybackState.PLAYING);
    } catch (e) {
      console.error("Play failed:", e);
      setPlaybackState(PlaybackState.STOPPED);
    }
  };

  const pause = () => {
    // ... existing pause
    if (audioRef.current) {
      audioRef.current.pause();
      setPlaybackState(PlaybackState.PAUSED);
    }
  };

  const stop = () => {
    // ... existing stop
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setPlaybackState(PlaybackState.STOPPED);
    setCurrentTime(0);
  };

  const next = () => {
    if (!currentPlaylist) return;

    let nextIndex;
    if (isShuffled && currentPlaylist.tracks.length > 1) {
      // Random index different from current
      do {
        nextIndex = Math.floor(Math.random() * currentPlaylist.tracks.length);
      } while (nextIndex === currentTrackIndex);
    } else {
      nextIndex = currentTrackIndex + 1;
    }

    if (nextIndex >= currentPlaylist.tracks.length) {
      // If we are shuffling, we might want to just stop or loop? 
      // For now, if we hit the limit in sequential, we stop. 
      // In shuffle, we never strictly "hit the limit" unless we track play history, 
      // but my simple random implementation handles index validity naturally.
      // However, if sequential and end reached:
      if (!isShuffled) {
        stop();
        return;
      }
    }

    // Bounds safety
    if (nextIndex >= currentPlaylist.tracks.length) nextIndex = 0;

    setCurrentTrackIndex(nextIndex);

    const wasPlaying = playbackState === PlaybackState.PLAYING;
    loadTrack(currentPlaylist.tracks[nextIndex]);

    if (wasPlaying) {
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

  const playTrack = (index: number) => {
    if (!currentPlaylist) return;
    if (index < 0 || index >= currentPlaylist.tracks.length) return;

    setCurrentTrackIndex(index);
    loadTrack(currentPlaylist.tracks[index]);

    // Use setTimeout to ensure the load processes before playing
    setTimeout(() => play(), 0);
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

  const loadPlaylist = (playlist: Playlist, startIndex: number = 0, autoPlay: boolean = false) => {
    stop();
    setCurrentPlaylist(playlist);

    const index = Math.max(0, Math.min(startIndex, playlist.tracks.length - 1));
    setCurrentTrackIndex(index);

    if (playlist.tracks[index]) {
      loadTrack(playlist.tracks[index]);
      if (autoPlay) {
        setTimeout(() => {
          play().catch(console.error);
        }, 50);
      } else {
        setPlaybackState(PlaybackState.STOPPED);
      }
    } else {
      setPlaybackState(PlaybackState.STOPPED);
    }
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

  const reorderTrack = async (playlistId: string, fromIndex: number, toIndex: number) => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) return;

    const newTracks = [...playlist.tracks];
    const [movedTrack] = newTracks.splice(fromIndex, 1);
    newTracks.splice(toIndex, 0, movedTrack);

    const updatedPlaylist = { ...playlist, tracks: newTracks };

    await savePlaylist(updatedPlaylist);
    setPlaylists(prev => prev.map(p => p.id === playlistId ? updatedPlaylist : p));

    if (currentPlaylist?.id === playlistId) {
      setCurrentPlaylist(updatedPlaylist);
      // Correct the current track index if needed
      if (currentTrackIndex === fromIndex) {
        setCurrentTrackIndex(toIndex);
      } else if (currentTrackIndex > fromIndex && currentTrackIndex <= toIndex) {
        setCurrentTrackIndex(currentTrackIndex - 1);
      } else if (currentTrackIndex < fromIndex && currentTrackIndex >= toIndex) {
        setCurrentTrackIndex(currentTrackIndex + 1);
      }
    }
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
      setVolume,
      playTrack,
      isShuffled,
      toggleShuffle,
      reorderTrack
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