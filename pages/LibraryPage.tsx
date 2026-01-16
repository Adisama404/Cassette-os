import React, { useState, useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { useTapeShelf } from '../hooks/useTapeShelf';
import { CassetteTape } from '../components/Deck/CassetteTape';
import { useNavigate } from 'react-router-dom';
import { Plus, MoreVertical, X, ArrowUpFromLine, Palette, Settings, Search } from 'lucide-react';
import { CassetteTheme, Playlist } from '../types';

export const LibraryPage: React.FC = () => {
    const {
        playlists,
        filteredPlaylists,
        searchQuery,
        setSearchQuery,
        contextMenu,
        setContextMenu,
        handleContextMenu,
        handleThemeChange,
        handleDelete,
        handleEject,
        currentPlaylist
    } = useTapeShelf();

    const navigate = useNavigate();

    // Deterministic random generator for organic shelf look
    const getTapeStyle = (id: string, index: number) => {
        const seed = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + index;
        const rand = (min: number, max: number) => {
            const x = Math.sin(seed) * 10000;
            return (x - Math.floor(x)) * (max - min) + min;
        };

        return {
            '--tw-rotate': `${rand(-2, 2)}deg`,
            '--tw-translate-y': `${rand(0, 12)}px`,
            '--tw-translate-x': `${rand(-6, 6)}px`,
        } as React.CSSProperties;
    };

    const themes: { id: CassetteTheme, color: string, label: string }[] = [
        { id: 'black', color: '#292524', label: 'Matte' },
        { id: 'white', color: '#f5f5f4', label: 'Grid' },
        { id: 'orange', color: '#ea580c', label: 'Clear' },
        { id: 'blue', color: '#1d4ed8', label: 'Tint' },
        { id: 'gold', color: '#a16207', label: 'Metal' },
        { id: 'sticker', color: '#fcd34d', label: 'Punk' },
        { id: 'caution', color: '#facc15', label: 'Hazard' },
        { id: 'neon', color: '#171717', label: 'Neon' },
    ];

    return (
        <div className="min-h-screen pt-8 pb-32 px-4 md:px-12 animate-enter" onContextMenu={(e) => e.preventDefault()}>
            <div className="flex justify-between items-center mb-12 border-b border-stone-800 pb-4">
                <h2 className="text-3xl font-mono text-stone-300 tracking-tight">TAPE SHELF</h2>
                <div className="flex items-center gap-3">
                    {/* Search Bar */}
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="SEARCH TAPES..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-stone-900 border border-stone-800 text-stone-300 rounded-sm py-2 pl-9 pr-4 text-xs font-mono focus:outline-none focus:border-green-500 w-32 focus:w-48 transition-all duration-300 placeholder:text-stone-600"
                        />
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-600 group-focus-within:text-green-500 transition-colors" />
                    </div>

                    <button
                        onClick={() => navigate('/settings')}
                        className="p-2 text-stone-500 hover:text-stone-300 transition-colors rounded-sm hover:bg-stone-900"
                        title="System Calibration"
                    >
                        <Settings size={20} />
                    </button>
                    <button
                        onClick={() => navigate('/add')}
                        className="flex items-center gap-2 px-4 py-2 bg-stone-800 text-stone-400 font-mono text-xs hover:bg-stone-700 hover:text-green-400 transition-colors rounded-sm border border-stone-700"
                    >
                        <Plus size={16} />
                        <span>NEW TAPE</span>
                    </button>
                </div>
            </div>

            {playlists.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-96 text-stone-600 font-mono animate-fade border-2 border-dashed border-stone-900 rounded-lg bg-stone-950/50">
                    <div className="mb-6 opacity-20">
                        <CassetteTape
                            playlist={{ id: 'demo', name: 'DEMO', tracks: [], theme: 'black', created: Date.now() }}
                            style={{ transform: 'scale(1.2) rotate(-5deg)' }}
                        />
                    </div>
                    <p className="mb-6 text-xl tracking-widest text-stone-500">SHELF EMPTY</p>
                    <button
                        onClick={() => navigate('/add')}
                        className="px-8 py-3 bg-green-900/20 border border-green-900/50 text-green-500 hover:bg-green-900/40 hover:text-green-400 hover:border-green-500 transition-all rounded uppercase tracking-wider text-sm flex items-center gap-3 group"
                    >
                        <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                        Initialize First Mixtape
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16 pb-24">
                    {filteredPlaylists.map((playlist, idx) => {
                        const tapeStyle = getTapeStyle(playlist.id, idx);
                        const isPlayingThis = currentPlaylist?.id === playlist.id;

                        return (
                            <div
                                key={playlist.id}
                                className="group relative animate-enter"
                                style={{ animationDelay: `${idx * 100}ms` }}
                                onContextMenu={(e) => handleContextMenu(e, playlist)}
                            >
                                {/* Tape Component */}
                                <div className="relative perspective-1000">
                                    <CassetteTape
                                        playlist={playlist}
                                        style={tapeStyle}
                                        className={`transform transition-all duration-500 ease-out 
                                          group-hover:!rotate-0 group-hover:!translate-x-0 group-hover:!-translate-y-6 
                                          group-hover:scale-110 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] z-0 group-hover:z-50
                                          ${isPlayingThis ? 'ring-2 ring-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.2)]' : ''}`}
                                        onClick={() => navigate(`/playlist/${playlist.id}`)}
                                    />
                                    {isPlayingThis && (
                                        <div className="absolute -top-3 -right-3 w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,1)] z-20"></div>
                                    )}
                                </div>

                                {/* Metadata Shelf Tag */}
                                <div className="mt-6 flex justify-between items-start font-mono text-xs text-stone-500 px-1 opacity-0 animate-fade group-hover:opacity-100 transition-opacity duration-300" style={{ animationDelay: `${idx * 100 + 300}ms` }}>
                                    <div>
                                        <span className={`block font-bold mb-1 truncate max-w-[150px] ${isPlayingThis ? 'text-green-400' : 'text-stone-300'}`}>
                                            {playlist.name}
                                        </span>
                                        <span>{playlist.tracks.length} TRACKS</span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <button
                                            className="p-2 text-stone-500 hover:text-stone-300 transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleContextMenu(e, playlist);
                                            }}
                                            title="Customize Shell"
                                        >
                                            <Palette size={16} />
                                        </button>
                                        <button
                                            className="p-2 text-stone-500 hover:text-stone-300 transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleContextMenu(e, playlist);
                                            }}
                                        >
                                            <MoreVertical size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Custom Context Menu */}
            {contextMenu && (
                <div
                    className="context-menu-container fixed z-50 bg-stone-900 border border-stone-700 shadow-2xl rounded-sm py-2 w-52 font-mono text-xs animate-fade"
                    style={{
                        top: Math.min(contextMenu.y, window.innerHeight - 250),
                        left: Math.min(contextMenu.x, window.innerWidth - 220)
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="px-4 py-2 border-b border-stone-800 text-stone-500 mb-2 flex justify-between items-center">
                        <span>OPTIONS</span>
                        <button onClick={() => setContextMenu(null)}><X size={12} /></button>
                    </div>

                    <div className="px-4 py-2">
                        <span className="block text-stone-400 mb-3 uppercase tracking-wider">Shell Design</span>
                        <div className="grid grid-cols-5 gap-2">
                            {themes.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => handleThemeChange(t.id)}
                                    className={`
                                group relative w-7 h-7 rounded-full border shadow-sm transition-transform hover:scale-110
                                ${contextMenu.playlist.theme === t.id ? 'ring-2 ring-stone-200 border-transparent scale-110' : 'border-stone-600'}
                            `}
                                    style={{ backgroundColor: t.color }}
                                    title={t.label}
                                >
                                    {t.id === 'white' && <div className="absolute inset-0 rounded-full opacity-30 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:2px_2px]"></div>}
                                    {t.id === 'orange' && <div className="absolute inset-0 rounded-full opacity-30 border-r border-black/20"></div>}
                                    {t.id === 'blue' && <div className="absolute inset-0 rounded-full opacity-30 bg-[linear-gradient(45deg,transparent_40%,rgba(0,0,0,0.2)_50%,transparent_60%)]"></div>}
                                    {t.id === 'gold' && <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 to-black/20"></div>}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-2 border-t border-stone-800 pt-2">
                        <button
                            onClick={() => navigate(`/playlist/${contextMenu.playlist.id}`)}
                            className="w-full text-left px-4 py-3 text-stone-300 hover:bg-stone-800 hover:text-green-400 flex items-center transition-colors"
                        >
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 opacity-0 hover:opacity-100"></span>
                            OPEN TAPE
                        </button>

                        {/* Context-aware Eject */}
                        {currentPlaylist?.id === contextMenu.playlist.id && (
                            <button
                                onClick={handleEject}
                                className="w-full text-left px-4 py-3 text-stone-400 hover:bg-stone-800 hover:text-stone-200 flex items-center transition-colors"
                            >
                                <ArrowUpFromLine size={12} className="mr-2" />
                                EJECT TAPE
                            </button>
                        )}

                        <button
                            onClick={handleDelete}
                            className="w-full text-left px-4 py-3 text-stone-500 hover:bg-stone-900 hover:text-red-500 flex items-center transition-colors"
                        >
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2 opacity-0 hover:opacity-100"></span>
                            DESTROY TAPE
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};