import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const SettingsPage: React.FC = () => {
    const navigate = useNavigate();
    const { setVolume, volume } = usePlayer();

    return (
        <div className="min-h-screen pt-8 pb-32 px-4 max-w-3xl mx-auto">
            <button onClick={() => navigate('/')} className="flex items-center text-stone-500 hover:text-stone-300 font-mono text-xs mb-8 transition-colors">
                <ArrowLeft size={16} className="mr-2" /> BACK TO SHELF
            </button>

            <h1 className="text-2xl font-mono text-stone-400 mb-12 tracking-widest border-b border-stone-800 pb-4">SYSTEM CALIBRATION</h1>

            <div className="bg-deck-metal rounded-lg p-8 border border-stone-700 shadow-2xl relative overflow-hidden">
                {/* Screws */}
                <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-stone-800 shadow-inner flex items-center justify-center"><div className="w-full h-[1px] bg-stone-600 rotate-45"></div></div>
                <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-stone-800 shadow-inner flex items-center justify-center"><div className="w-full h-[1px] bg-stone-600 rotate-12"></div></div>
                <div className="absolute bottom-2 left-2 w-3 h-3 rounded-full bg-stone-800 shadow-inner flex items-center justify-center"><div className="w-full h-[1px] bg-stone-600 rotate-90"></div></div>
                <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-stone-800 shadow-inner flex items-center justify-center"><div className="w-full h-[1px] bg-stone-600 rotate-0"></div></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

                    {/* Audio Section */}
                    <div>
                        <h3 className="font-mono text-xs text-stone-500 uppercase tracking-widest mb-6">Master Output</h3>

                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between font-mono text-xs text-stone-400 mb-2">
                                    <span>GAIN (VOLUME)</span>
                                    <span>{Math.round(volume * 100)}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={volume}
                                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-stone-900 rounded-lg appearance-none cursor-pointer accent-green-500"
                                />
                            </div>

                            <div className="opacity-50 pointer-events-none">
                                <div className="flex justify-between font-mono text-xs text-stone-400 mb-2">
                                    <span>TAPE HISS</span>
                                    <span>HIGH</span>
                                </div>
                                <div className="w-full h-2 bg-stone-900 rounded-lg relative overflow-hidden">
                                    <div className="absolute left-0 top-0 bottom-0 bg-stone-600 w-3/4"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mechanics Section */}
                    <div>
                        <h3 className="font-mono text-xs text-stone-500 uppercase tracking-widest mb-6">Mechanism</h3>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="font-mono text-xs text-stone-400">AUTO-STOP</span>
                                <div className="w-12 h-6 bg-green-900 rounded-full relative shadow-inner border border-green-800">
                                    <div className="absolute right-1 top-1 w-4 h-4 bg-green-500 rounded-full shadow-[0_0_5px_rgba(74,222,128,1)]"></div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between opacity-50">
                                <span className="font-mono text-xs text-stone-400">DOLBY NR</span>
                                <div className="w-12 h-6 bg-stone-900 rounded-full relative shadow-inner border border-stone-700">
                                    <div className="absolute left-1 top-1 w-4 h-4 bg-stone-600 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="mt-12 pt-8 border-t border-stone-700/50 text-center">
                    <p className="font-mono text-[0.6rem] text-stone-600">
                        CASSETTE.OS SYSTEM CORE<br />
                        SERIAL NO. 884-299-X<br />
                        MADE IN CYBERSPACE
                    </p>
                </div>
            </div>
        </div>
    );
};
