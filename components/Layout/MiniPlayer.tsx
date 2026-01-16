import React from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { PlaybackState } from '../../types';
import { Play, Pause, SkipForward, SkipBack, ArrowUpFromLine, Volume2, VolumeX } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useHaptics } from '../../hooks/useHaptics';
import { WavyProgressBar } from '../UI/WavyProgressBar';

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
        <div className="fixed bottom-0 left-0 right-0 bg-[#080808] shadow-[0_-10px_40px_rgba(0,0,0,0.8)] z-50 flex flex-col">

            {/* Progress Bar - Top Edge */}
            <div className="relative w-full z-10 bg-[#080808]">
                <WavyProgressBar
                    currentTime={currentTime}
                    duration={duration}
                    onSeek={seek}
                    amplitude={6}
                    frequency={15}
                    className="h-6 -mt-3 w-full"
                />
            </div>

            <div className="flex items-center justify-between px-3 py-2 md:px-8 h-16 md:h-20">

                {/* Track Info */}
                <div
                    className="flex-1 min-w-0 mr-2 md:mr-4 flex flex-col justify-center cursor-pointer group"
                    onClick={() => hasTape && navigate('/deck')}
                >
                    {hasTape ? (
                        <div className="flex items-center gap-3">
                            {isPlaying && (
                                <div className="hidden sm:flex items-end gap-[2px] h-8 pb-1">
                                    <div className="w-1 bg-green-500 animate-[bounce_1s_infinite] h-3"></div>
                                    <div className="w-1 bg-green-500 animate-[bounce_1.2s_infinite] h-5 delay-75"></div>
                                    <div className="w-1 bg-green-500 animate-[bounce_0.8s_infinite] h-4 delay-150"></div>
                                    <div className="w-1 bg-green-500 animate-[bounce_1.1s_infinite] h-6 delay-100"></div>
                                </div>
                            )}
                            <div className="min-w-0">
                                <div className="text-stone-300 font-mono text-xs md:text-sm truncate font-bold tracking-wide group-hover:text-green-400 transition-colors">
                                    {currentTrack?.title || "Unknown Track"}
                                </div>
                                <div className="flex items-center gap-2 text-stone-600 font-mono text-[10px] md:text-xs truncate uppercase tracking-widest mt-1">
                                    <span className="truncate">{currentTrack?.artist || "Unknown Artist"}</span>
                                    <span className="text-stone-700 mx-1 hidden md:inline">|</span>
                                    <span className="text-stone-500 hidden md:inline">{formatTime(currentTime)} / {formatTime(duration)}</span>
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
                <div className="flex items-center justify-center space-x-2 md:space-x-10 flex-shrink-0">
                    <button
                        onClick={() => handleControl(prev)}
                        disabled={!hasTape}
                        className="text-stone-500 hover:text-stone-200 disabled:opacity-20 transition-all p-2 active:translate-y-0.5 active:text-green-500"
                    >
                        <SkipBack size={20} fill="currentColor" />
                    </button>

                    {isPlaying ? (
                        <button
                            onClick={() => handleControl(pause)}
                            disabled={!hasTape}
                            className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-stone-200 text-stone-900 flex items-center justify-center hover:bg-white hover:scale-105 transition-all shadow-[0_4px_10px_rgba(255,255,255,0.2)] active:translate-y-1 active:shadow-none active:scale-100"
                        >
                            <Pause size={20} fill="currentColor" />
                        </button>
                    ) : (
                        <button
                            onClick={() => handleControl(play)}
                            disabled={!hasTape}
                            className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-stone-800 border border-stone-600 text-stone-300 flex items-center justify-center hover:border-green-500 hover:text-green-400 hover:scale-105 transition-all shadow-[0_4px_15px_rgba(0,0,0,0.5)] active:translate-y-1 active:shadow-none active:scale-100 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:border-stone-600 disabled:hover:text-stone-300"
                        >
                            <Play size={20} fill="currentColor" className="ml-1" />
                        </button>
                    )}

                    <button
                        onClick={() => handleControl(next)}
                        disabled={!hasTape}
                        className="text-stone-500 hover:text-stone-200 disabled:opacity-20 transition-all p-2 active:translate-y-0.5 active:text-green-500"
                    >
                        <SkipForward size={20} fill="currentColor" />
                    </button>
                </div>

                {/* Right Side: Volume & Eject */}
                <div className="flex-1 flex justify-end items-center gap-3 md:gap-8 min-w-0 pr-1">

                    {/* Time (Mobile Only) */}
                    {hasTape && (
                        <div className="text-[10px] font-mono text-stone-500 md:hidden whitespace-nowrap tracking-wider">
                            {formatTime(currentTime)}
                        </div>
                    )}

                    {/* Volume Bar */}
                    <div className="hidden sm:flex items-center gap-2 group relative">
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-stone-900 text-stone-300 text-[10px] font-mono py-1 px-2 rounded border border-stone-800 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                            VOL {Math.round(volume * 100)}%
                        </div>
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
                        className="text-stone-600 hover:text-stone-200 transition-all border-l border-stone-800 pl-3 md:pl-8 py-1 flex flex-col items-center gap-1 group active:translate-y-0.5 active:text-red-500"
                        title="Eject Tape"
                    >
                        <ArrowUpFromLine size={18} />
                    </button>
                </div>

            </div>
        </div>
    );
};