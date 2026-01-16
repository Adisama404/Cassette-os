import React from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { PlaybackState } from '../../types';
import { Play, Pause, SkipForward, SkipBack, ArrowUpFromLine, Volume2, VolumeX } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useHaptics } from '../../hooks/useHaptics';

export const MiniPlayer: React.FC = () => {
    const { play, pause, stop, next, prev, playbackState, currentPlaylist, currentTime, duration, seek, eject, volume, setVolume } = usePlayer();
    const navigate = useNavigate();
    const location = useLocation();
    const { trigger } = useHaptics();

    const isPlaying = playbackState === PlaybackState.PLAYING;
    const hasTape = !!currentPlaylist;

    const formatTime = (time: number) => {
        if (isNaN(time)) return "0:00";
        const min = Math.floor(time / 60);
        const sec = Math.floor(time % 60);
        return `${min}:${sec.toString().padStart(2, '0')}`;
    };

    const handleControl = (action: () => void) => {
        trigger();
        action();
    };

    const handleEject = (e: React.MouseEvent) => {
        e.stopPropagation();
        trigger();
        eject();
        // Navigate to library (root) if not already there
        if (location.pathname !== '/') {
            navigate('/');
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        seek(val);
    };

    const currentTrack = currentPlaylist?.tracks[usePlayer().currentTrackIndex];
    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-[#080808] border-t border-stone-800 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] z-50 flex flex-col">

            {/* Progress Bar - Top Edge */}
            <div className="relative w-full h-1 bg-stone-900 group">
                <div
                    className="absolute top-0 left-0 h-full bg-stone-500 transition-all duration-100 ease-linear group-hover:bg-green-500"
                    style={{ width: `${progressPercent}%` }}
                ></div>
                <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeek}
                    disabled={!hasTape}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
            </div>

            <div className="flex items-center justify-between px-4 py-3 md:px-8 h-20">

                {/* Track Info */}
                <div
                    className="flex-1 min-w-0 mr-4 flex flex-col justify-center cursor-pointer group"
                    onClick={() => hasTape && navigate('/deck')}
                >
                    {hasTape ? (
                        <div className="flex items-center gap-4">
                            {isPlaying && (
                                <div className="flex items-end gap-[2px] h-8 pb-1">
                                    <div className="w-1 bg-green-500 animate-[bounce_1s_infinite] h-3"></div>
                                    <div className="w-1 bg-green-500 animate-[bounce_1.2s_infinite] h-5 delay-75"></div>
                                    <div className="w-1 bg-green-500 animate-[bounce_0.8s_infinite] h-4 delay-150"></div>
                                    <div className="w-1 bg-green-500 animate-[bounce_1.1s_infinite] h-6 delay-100"></div>
                                </div>
                            )}
                            <div>
                                <div className="text-stone-300 font-mono text-xs md:text-sm truncate font-bold tracking-wide group-hover:text-green-400 transition-colors">
                                    {currentTrack?.title || "Unknown Track"}
                                </div>
                                <div className="flex items-center gap-2 text-stone-600 font-mono text-[10px] md:text-xs truncate uppercase tracking-widest mt-1">
                                    <span>{currentTrack?.artist || "Unknown Artist"}</span>
                                    <span className="text-stone-700 mx-1">|</span>
                                    <span className="text-stone-500">{formatTime(currentTime)} / {formatTime(duration)}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div
                            className="text-stone-700 font-mono text-xs uppercase tracking-widest animate-pulse cursor-pointer hover:text-green-600 transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate('/add');
                            }}
                        >
                            NO TAPE INSERTED
                        </div>
                    )}
                </div>

                {/* Center Controls */}
                <div className="flex items-center justify-center space-x-6 md:space-x-10">
                    <button
                        onClick={() => handleControl(prev)}
                        disabled={!hasTape}
                        className="text-stone-500 hover:text-stone-200 disabled:opacity-20 transition-colors p-2"
                    >
                        <SkipBack size={22} fill="currentColor" />
                    </button>

                    {isPlaying ? (
                        <button
                            onClick={() => handleControl(pause)}
                            disabled={!hasTape}
                            className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-stone-200 text-stone-900 flex items-center justify-center hover:bg-white hover:scale-105 transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] active:scale-95"
                        >
                            <Pause size={24} fill="currentColor" />
                        </button>
                    ) : (
                        <button
                            onClick={() => handleControl(play)}
                            disabled={!hasTape}
                            className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-stone-800 border border-stone-600 text-stone-300 flex items-center justify-center hover:border-green-500 hover:text-green-400 hover:scale-105 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:border-stone-600 disabled:hover:text-stone-300"
                        >
                            <Play size={24} fill="currentColor" className="ml-1" />
                        </button>
                    )}

                    <button
                        onClick={() => handleControl(next)}
                        disabled={!hasTape}
                        className="text-stone-500 hover:text-stone-200 disabled:opacity-20 transition-colors p-2"
                    >
                        <SkipForward size={22} fill="currentColor" />
                    </button>
                </div>

                {/* Right Side: Volume & Eject */}
                <div className="flex-1 flex justify-end items-center gap-6 md:gap-8 min-w-0">

                    {/* Volume Bar */}
                    <div className="hidden sm:flex items-center gap-2 group">
                        <button
                            onClick={() => setVolume(volume > 0 ? 0 : 0.5)}
                            className="text-stone-600 group-hover:text-stone-400 transition-colors"
                        >
                            {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                        </button>
                        <div className="w-20 h-1 bg-stone-800 rounded-full relative cursor-pointer overflow-hidden">
                            <div
                                className="absolute inset-y-0 left-0 bg-stone-600 group-hover:bg-stone-400 transition-colors"
                                style={{ width: `${volume * 100}%` }}
                            ></div>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={volume}
                                onChange={(e) => setVolume(parseFloat(e.target.value))}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                        </div>
                    </div>

                    {/* Eject Button */}
                    <button
                        onClick={handleEject}
                        className="text-stone-600 hover:text-stone-200 transition-colors border-l border-stone-800 pl-6 md:pl-8 py-1 flex flex-col items-center gap-1 group"
                        title="Eject Tape"
                    >
                        <ArrowUpFromLine size={20} />
                    </button>
                </div>

            </div>
        </div>
    );
};