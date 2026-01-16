import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const SettingsPage: React.FC = () => {
    const navigate = useNavigate();
    const { setVolume, volume } = usePlayer();
    const { theme, setTheme } = useTheme();

    return (
        <div className="min-h-screen pt-8 pb-32 px-4 max-w-3xl mx-auto animate-enter">
            <button
                onClick={() => navigate('/')}
                className="flex items-center font-mono text-xs mb-8 transition-colors hover:brightness-125"
                style={{ color: 'var(--lcd-subtext)' }}
            >
                <ArrowLeft size={16} className="mr-2" /> BACK TO SHELF
            </button>

            <h1 className="text-2xl font-mono mb-12 tracking-widest border-b pb-4"
                style={{ color: 'var(--lcd-text)', borderColor: 'var(--deck-border)', fontFamily: 'var(--font-display)' }}>
                SYSTEM CALIBRATION
            </h1>

            <div className="rounded-xl p-8 border shadow-2xl relative overflow-hidden transition-colors duration-500"
                style={{ backgroundColor: 'var(--deck-bg)', borderColor: 'var(--deck-border)' }}>

                {/* Screws */}
                <div className="absolute top-3 left-3 w-3 h-3 rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] flex items-center justify-center" style={{ backgroundColor: 'var(--deck-screws)' }}><div className="w-full h-[1px] bg-[#333] rotate-45"></div></div>
                <div className="absolute top-3 right-3 w-3 h-3 rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] flex items-center justify-center" style={{ backgroundColor: 'var(--deck-screws)' }}><div className="w-full h-[1px] bg-[#333] rotate-12"></div></div>
                <div className="absolute bottom-3 left-3 w-3 h-3 rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] flex items-center justify-center" style={{ backgroundColor: 'var(--deck-screws)' }}><div className="w-full h-[1px] bg-[#333] rotate-90"></div></div>
                <div className="absolute bottom-3 right-3 w-3 h-3 rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] flex items-center justify-center" style={{ backgroundColor: 'var(--deck-screws)' }}><div className="w-full h-[1px] bg-[#333] rotate-0"></div></div>

                <div className="space-y-12 relative z-10">

                    {/* Audio Section */}
                    <div>
                        <h3 className="font-mono text-xs uppercase tracking-widest mb-6 opacity-60" style={{ color: 'var(--lcd-subtext)' }}>Master Output</h3>

                        <div className="max-w-md">
                            <div className="flex justify-between font-mono text-xs mb-2" style={{ color: 'var(--lcd-text)' }}>
                                <span>GAIN</span>
                                <span>{Math.round(volume * 100)}%</span>
                            </div>
                            <div className="relative h-2 w-full rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--deck-border)' }}>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={volume}
                                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div
                                    className="h-full bg-green-500 transition-all duration-100 ease-out"
                                    style={{ width: `${volume * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* Visual Interface Section */}
                    <div className="pt-8 border-t" style={{ borderColor: 'var(--deck-border)' }}>
                        <h3 className="font-mono text-xs uppercase tracking-widest mb-6 opacity-60" style={{ color: 'var(--lcd-subtext)' }}>Visual Interface</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <button
                                onClick={() => setTheme('default')}
                                className={`h-32 rounded-lg border relative overflow-hidden transition-all group ${theme === 'default' ? 'ring-2 ring-green-500 border-transparent shadow-[0_0_20px_rgba(34,197,94,0.2)]' : 'border-stone-800 hover:border-stone-600'}`}
                            >
                                <div className="absolute inset-0 bg-[#0a0a0a]"></div>
                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-green-900/20 to-transparent"></div>
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 z-10">
                                    <div className={`w-2 h-2 rounded-full mb-2 ${theme === 'default' ? 'bg-green-500 animate-pulse' : 'bg-stone-800'}`}></div>
                                    <span className={`font-mono text-sm tracking-widest ${theme === 'default' ? 'text-green-400' : 'text-stone-500'}`}>DEFAULT</span>
                                    <span className="text-[10px] text-stone-600 font-mono mt-1 opacity-60">THE VOID</span>
                                </div>
                            </button>

                            <button
                                onClick={() => setTheme('blue-note')}
                                className={`h-32 rounded-lg border relative overflow-hidden transition-all group ${theme === 'blue-note' ? 'ring-2 ring-amber-500 border-transparent shadow-[0_0_20px_rgba(245,158,11,0.2)]' : 'border-stone-800 hover:border-amber-900/50'}`}
                            >
                                <div className="absolute inset-0 bg-[#1c120d] bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]"></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 z-10">
                                    <div className={`w-2 h-2 rounded-full mb-2 ${theme === 'blue-note' ? 'bg-amber-500 animate-pulse' : 'bg-stone-800'}`}></div>
                                    <span className={`font-serif italic text-lg ${theme === 'blue-note' ? 'text-amber-400' : 'text-stone-600 group-hover:text-amber-700'}`}>Blue Note</span>
                                    <span className="text-[10px] text-stone-600 font-mono mt-1 opacity-60">LOUNGE</span>
                                </div>
                            </button>

                            <button
                                onClick={() => setTheme('grunge')}
                                className={`h-32 rounded-lg border relative overflow-hidden transition-all group ${theme === 'grunge' ? 'ring-2 ring-lime-600 border-transparent shadow-[0_0_20px_rgba(101,163,13,0.2)]' : 'border-stone-800 hover:border-lime-900/50'}`}
                            >
                                <div className="absolute inset-0 bg-[#151515] bg-[url('https://www.transparenttextures.com/patterns/concrete-wall-2.png')]"></div>
                                <div className="absolute inset-0 bg-black/40"></div>
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 z-10">
                                    <div className={`w-2 h-2 rounded-full mb-2 ${theme === 'grunge' ? 'bg-lime-600 animate-pulse' : 'bg-stone-800'}`}></div>
                                    <span className={`font-marker text-lg ${theme === 'grunge' ? 'text-lime-500 -rotate-2' : 'text-stone-600 group-hover:text-stone-500'}`}>GRUNGE</span>
                                    <span className="text-[10px] text-stone-600 font-mono mt-1 opacity-60">UNDERGROUND</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t text-center opacity-40" style={{ borderColor: 'var(--deck-border)' }}>
                    <p className="font-mono text-[0.6rem]" style={{ color: 'var(--lcd-subtext)' }}>
                        CASSETTE.OS SYSTEM CORE<br />
                        SERIAL NO. 884-299-X<br />
                        MADE IN CYBERSPACE
                    </p>
                </div>
            </div>
        </div>
    );
};
