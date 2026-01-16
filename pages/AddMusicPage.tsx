import React, { useState, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { useNavigate } from 'react-router-dom';
import { Upload, Music, ArrowLeft } from 'lucide-react';
import { CassetteTheme } from '../types';
import { CassetteTape } from '../components/Deck/CassetteTape';

const THEMES: { id: CassetteTheme; label: string; color: string }[] = [
    { id: 'black', label: 'Classic Black', color: '#292524' }, // stone-800
    { id: 'white', label: 'Bone White', color: '#e5e5e5' }, // stone-200
    { id: 'orange', label: 'Amber Plastic', color: '#ea580c' }, // orange-600
    { id: 'blue', label: 'Cobalt Blue', color: '#2563eb' }, // blue-600
    { id: 'gold', label: 'Master Gold', color: '#a16207' }, // yellow-700
];

export const AddMusicPage: React.FC = () => {
    const { addPlaylist } = usePlayer();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [files, setFiles] = useState<(File | { path: string; name: string })[]>([]);
    const [theme, setTheme] = useState<CassetteTheme>('black');
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files) {
            const audioFiles = (Array.from(e.dataTransfer.files) as File[]).filter(f => f.type.startsWith('audio/'));
            setFiles(prev => [...prev, ...audioFiles]);
        }
    };


    const handleBrowseClick = async () => {
        if (window.electron) {
            // Native Electron Dialog
            try {
                const paths = await window.electron.selectFiles();
                if (paths && paths.length > 0) {
                    const nativeFiles = paths.map(p => {
                        // Extract filename from path (unix/windows safe ish)
                        const name = p.split(/[/\\]/).pop() || 'Unknown';
                        return { path: p, name };
                    });
                    setFiles(prev => [...prev, ...nativeFiles as any]);
                }
            } catch (e) {
                console.error("Native select failed", e);
            }
        } else {
            // Web Fallback
            fileInputRef.current?.click();
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const audioFiles = (Array.from(e.target.files) as File[]).filter(f => f.type.startsWith('audio/'));
            setFiles(prev => [...prev, ...audioFiles]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || files.length === 0) return;

        await addPlaylist(name, files, theme);
        navigate('/library');
    };

    return (
        <div className="min-h-screen pt-8 pb-32 px-4 flex flex-col items-center">
            <div className="w-full max-w-lg mb-4">
                <button onClick={() => navigate('/library')} className="flex items-center text-stone-500 hover:text-stone-300 font-mono text-xs transition-colors">
                    <ArrowLeft size={16} className="mr-2" /> BACK TO SHELF
                </button>
            </div>

            <h2 className="text-2xl font-mono text-stone-300 mb-8 tracking-widest">RECORD NEW TAPE</h2>

            <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-8">

                {/* Preview */}
                <div className="flex justify-center mb-8 transform scale-90 sm:scale-100">
                    <div className="w-64">
                        <CassetteTape previewTheme={theme} playlist={{ name: name || 'UNTITLED' } as any} />
                    </div>
                </div>

                {/* Name Input */}
                <div className="space-y-2">
                    <label className="block font-mono text-xs text-stone-500 uppercase">Tape Label</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Mixtape Vol. 1"
                        className="w-full bg-stone-900 border-b-2 border-stone-700 text-xl font-hand p-2 text-stone-200 focus:border-green-500 focus:outline-none placeholder-stone-700 transition-colors"
                        autoFocus
                    />
                </div>

                {/* Theme Selector */}
                <div className="space-y-2">
                    <label className="block font-mono text-xs text-stone-500 uppercase">Tape Shell Design</label>
                    <div className="flex flex-wrap gap-4 mt-2">
                        {THEMES.map((t) => (
                            <button
                                key={t.id}
                                type="button"
                                onClick={() => setTheme(t.id)}
                                className={`
                            relative w-10 h-10 rounded-full border-2 shadow-lg transition-transform hover:scale-110
                            ${theme === t.id ? 'border-green-400 scale-110 ring-2 ring-green-900' : 'border-stone-600'}
                        `}
                                style={{ backgroundColor: t.color }}
                                title={t.label}
                            >
                                {theme === t.id && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                    <p className="text-xs font-mono text-stone-600 mt-1">{THEMES.find(t => t.id === theme)?.label}</p>
                </div>

                {/* Drop Zone */}
                <div
                    className={`
                relative w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-all duration-300 cursor-pointer
                ${isDragging ? 'border-green-500 bg-green-900/10' : 'border-stone-700 bg-stone-900/50'}
                hover:border-stone-500
            `}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={handleBrowseClick}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        multiple
                        accept="audio/*"
                        className="hidden"
                    />

                    <Upload size={32} className={`mb-2 ${isDragging ? 'text-green-500' : 'text-stone-600'}`} />
                    <p className="font-mono text-stone-400 text-sm">DROP AUDIO FILES</p>
                    <p className="font-mono text-stone-600 text-xs mt-1">CLICK TO BROWSE</p>
                </div>

                {/* File List */}
                {files.length > 0 && (
                    <div className="bg-stone-900 border border-stone-800 rounded p-4 max-h-48 overflow-y-auto">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-mono text-stone-500">{files.length} TRACKS QUEUED</span>
                            <button type="button" onClick={() => setFiles([])} className="text-xs font-mono text-red-900 hover:text-red-500">CLEAR ALL</button>
                        </div>
                        <ul className="space-y-2">
                            {files.map((f, i) => (
                                <li key={i} className="flex items-center text-xs font-mono text-stone-400 border-b border-stone-800 pb-1 last:border-0">
                                    <Music size={12} className="mr-2 text-stone-600" />
                                    <span className="truncate flex-1">{f.name}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={!name || files.length === 0}
                        className="bg-stone-800 text-stone-300 font-mono px-8 py-3 rounded-sm border border-stone-600 hover:bg-stone-700 hover:text-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg active:translate-y-1"
                    >
                        PRESS RECORD
                    </button>
                </div>
            </form>
        </div>
    );
};
