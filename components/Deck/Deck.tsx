import React, { useState, useEffect, useRef } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { PlaybackState } from '../../types';
import { CassetteTape } from './CassetteTape';
import { WavyProgressBar } from '../UI/WavyProgressBar';
import { Shuffle } from 'lucide-react';

export const Deck: React.FC = () => {
    const { currentPlaylist, playbackState, currentTrackIndex, currentTime, duration, seek, isShuffled, toggleShuffle } = usePlayer();

    const [shaking, setShaking] = useState(false);

    const handleShuffle = () => {
        toggleShuffle();
        setShaking(true);
        setTimeout(() => setShaking(false), 500);
    };

    const formatTime = (time: number) => {
        if (isNaN(time)) return "0:00";
        const min = Math.floor(time / 60);
        const sec = Math.floor(time % 60);
        return `${min}:${sec.toString().padStart(2, '0')}`;
    };

    // We use this to trigger the insertion animation whenever the playlist ID changes
    const [tapeKey, setTapeKey] = useState<string>('');

    useEffect(() => {
        if (currentPlaylist?.id) {
            setTapeKey(currentPlaylist.id);
        }
    }, [currentPlaylist?.id]);

    // -- Physics Based Reel Animation --
    const leftReelRef = useRef<HTMLDivElement>(null);
    const rightReelRef = useRef<HTMLDivElement>(null);

    // Refs for animation state to avoid re-renders
    const stateRef = useRef({
        leftRotation: 0,
        rightRotation: 0,
        leftVelocity: 0,
        rightVelocity: 0
    });

    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        const animate = () => {
            let targetV = 0;

            if (playbackState === PlaybackState.PLAYING) {
                targetV = -2.5;
            } else if (playbackState === PlaybackState.FAST_FORWARDING) {
                targetV = -15;
            } else if (playbackState === PlaybackState.REWINDING) {
                targetV = 15;
            } else {
                targetV = 0;
            }

            const ease = 0.05;

            stateRef.current.leftVelocity += (targetV - stateRef.current.leftVelocity) * ease;
            stateRef.current.rightVelocity += (targetV - stateRef.current.rightVelocity) * ease;

            stateRef.current.leftRotation += stateRef.current.leftVelocity;
            stateRef.current.rightRotation += stateRef.current.rightVelocity;

            if (leftReelRef.current) {
                leftReelRef.current.style.transform = `rotate(${stateRef.current.leftRotation}deg)`;
            }
            if (rightReelRef.current) {
                rightReelRef.current.style.transform = `rotate(${stateRef.current.rightRotation}deg)`;
            }

            if (
                Math.abs(stateRef.current.leftVelocity) > 0.01 ||
                Math.abs(targetV) > 0
            ) {
                rafRef.current = requestAnimationFrame(animate);
            }
        };

        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(animate);

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [playbackState]);

    return (
        <div className="relative w-full max-w-2xl aspect-[1.5] rounded-xl p-4 md:p-8 flex flex-col items-center justify-center animate-enter z-20">

            {/* Deck Chassis Background */}
            <div className="absolute inset-0 rounded-xl shadow-2xl border transition-colors duration-500" style={{ backgroundColor: 'var(--deck-bg)', borderColor: 'var(--deck-border)' }}></div>
            <div className="absolute inset-0 opacity-10 pointer-events-none rounded-xl transition-all duration-500" style={{ backgroundImage: 'var(--deck-surface-pattern)' }}></div>

            {/* Cosmetic Screws */}
            <div className="absolute top-3 left-3 w-3 h-3 rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] flex items-center justify-center z-20" style={{ backgroundColor: 'var(--deck-screws)' }}><div className="w-full h-[1px] bg-[#333] rotate-45"></div></div>
            <div className="absolute top-3 right-3 w-3 h-3 rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] flex items-center justify-center z-20" style={{ backgroundColor: 'var(--deck-screws)' }}><div className="w-full h-[1px] bg-[#333] rotate-12"></div></div>
            <div className="absolute bottom-3 left-3 w-3 h-3 rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] flex items-center justify-center z-20" style={{ backgroundColor: 'var(--deck-screws)' }}><div className="w-full h-[1px] bg-[#333] rotate-90"></div></div>
            <div className="absolute bottom-3 right-3 w-3 h-3 rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] flex items-center justify-center z-20" style={{ backgroundColor: 'var(--deck-screws)' }}><div className="w-full h-[1px] bg-[#333] rotate-0"></div></div>

            {/* Tape Window / Bay */}
            <div className="relative w-full h-[70%] bg-[#080808] rounded-lg shadow-[inset_0_10px_20px_rgba(0,0,0,1)] overflow-hidden border-8 flex items-center justify-center z-10 transition-colors duration-500" style={{ borderColor: 'var(--deck-border)' }}>

                {/* Background Mechanics */}
                <div className="absolute inset-0 flex justify-between items-center px-[15%] opacity-40 pointer-events-none">
                    {/* Left Spindle */}
                    <div className="w-16 h-16 md:w-24 md:h-24 rounded-full border-4 border-stone-700 bg-stone-900 flex items-center justify-center">
                        <div className="w-full h-2 bg-stone-800 absolute"></div>
                        <div className="h-full w-2 bg-stone-800 absolute"></div>
                    </div>
                    {/* Right Spindle */}
                    <div className="w-16 h-16 md:w-24 md:h-24 rounded-full border-4 border-stone-700 bg-stone-900 flex items-center justify-center">
                        <div className="w-full h-2 bg-stone-800 absolute"></div>
                        <div className="h-full w-2 bg-stone-800 absolute"></div>
                    </div>
                </div>

                {/* The Cassette (if inserted) */}
                {currentPlaylist ? (
                    <div key={tapeKey} className={`relative w-[90%] z-20 transform-gpu ${shaking ? 'animate-shake' : 'animate-tape-insert'}`}>
                        <CassetteTape
                            playlist={currentPlaylist}
                            isInserted={true}
                            leftReelRef={leftReelRef}
                            rightReelRef={rightReelRef}
                        />
                    </div>
                ) : (
                    <div className="z-20 font-mono animate-pulse text-sm md:text-lg tracking-[0.3em] uppercase border px-6 py-3 rounded shadow-[0_0_15px_rgba(153,27,27,0.1)] transition-colors"
                        style={{ color: 'var(--lcd-text)', borderColor: 'var(--lcd-border)', fontFamily: 'var(--font-display)' }}>
                        No Cassette
                    </div>
                )}

                {/* Glass Reflection */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none z-30 rounded-lg"></div>
                <div className="absolute top-0 right-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none z-30"></div>
            </div>

            {/* Track Info LCD */}
            <div className="w-full mt-3 sm:mt-6 h-20 sm:h-24 rounded border shadow-[inset_0_2px_10px_rgba(0,0,0,1)] flex flex-col justify-center px-4 sm:px-6 relative overflow-hidden z-10 transition-all duration-300"
                style={{
                    backgroundColor: 'var(--lcd-bg)',
                    borderColor: 'var(--lcd-border)',
                    boxShadow: `inset 0 0 20px var(--lcd-shadow)`,
                    fontFamily: 'var(--font-display)'
                }}
            >

                {/* LCD Grid Texture */}
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[size:4px_4px] pointer-events-none"></div>

                {currentPlaylist ? (
                    <div className="w-full h-full flex flex-col justify-center py-2 animate-fade relative z-10 gap-2">

                        {/* Top Row: Track & Mode */}
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase opacity-70" style={{ color: 'var(--lcd-subtext)' }}>Track No.</span>
                                <span className="text-xl md:text-2xl leading-none font-bold tracking-widest drop-shadow-md" style={{ color: 'var(--lcd-text)' }}>{String(currentTrackIndex + 1).padStart(2, '0')}</span>
                            </div>
                            <div className="flex flex-col items-center flex-1 mx-4 overflow-hidden">
                                <div className="whitespace-nowrap overflow-hidden w-full text-center mask-linear-fade">
                                    <span className="animate-marquee inline-block tracking-widest opacity-90" style={{ color: 'var(--lcd-text)' }}>
                                        {currentPlaylist.tracks[currentTrackIndex]?.title} <span className="opacity-50 mx-2">//</span> {currentPlaylist.tracks[currentTrackIndex]?.artist}
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] uppercase opacity-70" style={{ color: 'var(--lcd-subtext)' }}>Mode</span>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={handleShuffle}
                                        className={`p-1 rounded transition-colors hover:opacity-100 ${isShuffled ? 'opacity-100 bg-white/10' : 'opacity-50'}`}
                                        style={{ color: 'var(--lcd-text)' }}
                                        title="Shuffle Shake"
                                    >
                                        <Shuffle size={14} />
                                    </button>
                                    <span className="text-[10px] uppercase tracking-widest animate-pulse" style={{ color: 'var(--lcd-subtext)' }}>{playbackState}</span>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Row: Time & Progress */}
                        <div className="w-full flex items-center gap-4">
                            {/* Time Display */}
                            <div className="text-xs tracking-wider w-20 text-right opacity-90" style={{ color: 'var(--lcd-text)' }}>
                                {formatTime(currentTime)} <span className="opacity-50">/</span> {formatTime(duration)}
                            </div>

                            {/* Wavy Progress Bar */}
                            <div className="flex-1 px-4">
                                <WavyProgressBar
                                    currentTime={currentTime}
                                    duration={duration}
                                    onSeek={seek}
                                    amplitude={15}
                                    frequency={12}
                                />
                            </div>
                        </div>

                    </div>
                ) : (
                    <div className="w-full text-center opacity-40 uppercase tracking-[0.5em] text-xs relative z-10" style={{ color: 'var(--lcd-text)' }}>Standby</div>
                )}
            </div>

        </div >
    );
};