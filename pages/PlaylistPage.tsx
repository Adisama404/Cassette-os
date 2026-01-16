import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';
import { Playlist } from '../types';
import { CassetteTape } from '../components/Deck/CassetteTape';
import { Play, Trash2, ArrowLeft, Plus, X } from 'lucide-react';

export const PlaylistPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    playlists, 
    deletePlaylist, 
    loadPlaylist, 
    currentPlaylist, 
    currentTrackIndex, 
    addTracksToPlaylist,
    removeTrackFromPlaylist 
  } = usePlayer();
  const [playlist, setPlaylist] = useState<Playlist | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const found = playlists.find(p => p.id === id);
    if (found) setPlaylist(found);
  }, [id, playlists]);

  if (!playlist) return null;

  const isCurrentTape = currentPlaylist?.id === playlist.id;

  const handlePlay = () => {
    loadPlaylist(playlist);
    navigate('/deck');
  };

  const handleDeletePlaylist = () => {
      if (confirm('Are you sure you want to destroy this tape? This cannot be undone.')) {
          deletePlaylist(playlist.id);
          navigate('/');
      }
  };

  const handleAddTracks = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          const files = Array.from(e.target.files);
          addTracksToPlaylist(playlist.id, files);
          e.target.value = '';
      }
  };

  const handleRemoveTrack = (e: React.MouseEvent, trackId: string) => {
      e.stopPropagation();
      removeTrackFromPlaylist(playlist.id, trackId);
  };

  return (
    <div className="min-h-screen pt-8 pb-32 px-4 md:px-12 max-w-4xl mx-auto animate-enter">
      {/* Nav */}
      <button onClick={() => navigate('/')} className="flex items-center text-stone-500 hover:text-stone-300 font-mono text-xs mb-8 transition-colors">
          <ArrowLeft size={16} className="mr-2"/> BACK TO SHELF
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left: Tape Visual & Controls */}
          <div className="flex flex-col items-center">
              <div className="w-full max-w-sm animate-enter">
                <CassetteTape playlist={playlist} className="w-full" />
              </div>
              
              <div className="flex mt-8 space-x-4 animate-enter stagger-2">
                  <button 
                    onClick={handlePlay}
                    className="flex items-center space-x-2 bg-stone-800 text-green-500 px-6 py-3 rounded border border-stone-700 hover:bg-stone-700 hover:scale-105 transition-all shadow-lg active:translate-y-1"
                  >
                      <Play size={20} fill="currentColor" />
                      <span className="font-mono font-bold">INSERT & PLAY</span>
                  </button>
                  <button 
                    onClick={handleDeletePlaylist}
                    className="flex items-center space-x-2 bg-stone-900 text-red-900 px-4 py-3 rounded border border-stone-800 hover:text-red-500 hover:border-red-900 transition-colors active:translate-y-1"
                    title="Destroy Tape"
                  >
                      <Trash2 size={18} />
                  </button>
              </div>
          </div>

          {/* Right: Tracklist */}
          <div className="bg-stone-900/50 rounded-lg border border-stone-800 flex flex-col h-[500px] animate-enter stagger-1">
             {/* Header */}
             <div className="p-6 border-b border-stone-800 flex justify-between items-center bg-stone-900/80">
                 <h2 className="font-hand text-2xl text-stone-300">{playlist.name}</h2>
                 
                 <div className="relative">
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-3 py-1 bg-stone-800 text-stone-400 font-mono text-xs hover:text-green-400 hover:border-green-500 border border-stone-700 transition-colors rounded-sm"
                    >
                        <Plus size={12} /> ADD SONGS
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleAddTracks}
                        multiple
                        accept="audio/*"
                        className="hidden"
                    />
                 </div>
             </div>
             
             {/* List */}
             <div className="overflow-y-auto flex-1 p-2 custom-scrollbar">
                 <ul className="space-y-1">
                     {playlist.tracks.map((track, idx) => {
                         const isPlayingThis = isCurrentTape && currentTrackIndex === idx;
                         return (
                             <li 
                                key={track.id} 
                                className={`
                                    group flex items-center justify-between p-3 rounded font-mono text-xs cursor-default transition-all duration-300
                                    animate-enter
                                    ${isPlayingThis ? 'bg-green-900/20 text-green-400' : 'text-stone-500 hover:bg-stone-800 hover:text-stone-300'}
                                `}
                                style={{ animationDelay: `${idx * 50 + 200}ms` }}
                             >
                                 <div className="flex items-center overflow-hidden flex-1 mr-4">
                                     <span className={`w-6 flex-shrink-0 ${isPlayingThis ? 'opacity-100' : 'opacity-50'}`}>
                                         {String(idx + 1).padStart(2, '0')}
                                     </span>
                                     <span className="truncate">{track.title}</span>
                                 </div>
                                 
                                 <div className="flex items-center">
                                    {isPlayingThis && <span className="text-[0.6rem] uppercase tracking-wider mr-4 animate-pulse">PLAYING</span>}
                                    
                                    <button 
                                        onClick={(e) => handleRemoveTrack(e, track.id)}
                                        className="text-stone-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                        title="Remove Track"
                                    >
                                        <X size={14} />
                                    </button>
                                 </div>
                             </li>
                         );
                     })}
                 </ul>
                 
                 {playlist.tracks.length === 0 && (
                     <div className="flex flex-col items-center justify-center h-full text-stone-600 font-mono text-sm opacity-50">
                         <span>BLANK TAPE</span>
                         <span className="text-xs mt-2">Add songs to begin</span>
                     </div>
                 )}
             </div>
          </div>
      </div>
    </div>
  );
};