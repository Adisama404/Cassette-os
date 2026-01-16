import React, { useMemo, useEffect } from 'react';
import { Playlist } from '../../types';
import { CassetteTape } from '../Deck/CassetteTape';
import { usePhysics, PhysicsBody } from '../../hooks/usePhysics';
import { ArrowDownToLine } from 'lucide-react';
import { useMechanicalSounds } from '../../hooks/useMechanicalSounds';

interface TheStackProps {
    playlists: Playlist[];
    onLoad: (playlist: Playlist) => void;
}

export const TheStack: React.FC<TheStackProps> = ({ playlists, onLoad }) => {
    const { playInsert, playSwitch } = useMechanicalSounds();
    const [wasHovering, setWasHovering] = React.useState(false);
    const [loadingId, setLoadingId] = React.useState<string | null>(null);

    // Initialize random positions
    // We memoize this so it doesn't reset on every render, strictly dependent on playlist IDs
    const initialBodies = useMemo(() => {
        const { innerWidth, innerHeight } = window;
        const isMobile = innerWidth < 600;
        // Scale down for mobile
        const width = isMobile ? 240 : 300;
        const height = isMobile ? 152 : 190; // Maintain approx ratio

        return playlists.map(p => ({
            id: p.id,
            x: Math.random() * (innerWidth - width),
            y: Math.random() * (innerHeight - 450) + 250,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            rotation: Math.random() * 360,
            vRotation: (Math.random() - 0.5) * 5,
            isDragging: false,
            width,
            height,
            mass: 1
        } as PhysicsBody));
    }, [playlists]);

    const { bodies, onPointerDown } = usePhysics(initialBodies);

    // Check if any tape is hovering the drop zone
    const isHovering = useMemo(() => {
        if (loadingId) return false; // Don't hover if loading
        const dragging = bodies.find(b => b.isDragging);
        if (!dragging) return false;
        return dragging.y < 120;
    }, [bodies, loadingId]);

    // Sound effect on entry
    useEffect(() => {
        if (isHovering && !wasHovering) {
            playSwitch();
        }
        setWasHovering(isHovering);
    }, [isHovering, wasHovering, playSwitch]);

    const handlePointerUp = (e: React.PointerEvent, body: PhysicsBody, playlist: Playlist) => {
        if (loadingId) return;

        // If dropped in zone
        if (body.y < 120) {
            // Trigger Loading Sequence
            setLoadingId(playlist.id);
            playSwitch(); // Mechanism Clunk

            // Animation sequence
            setTimeout(() => {
                playInsert(); // Final Insertion Click
                onLoad(playlist);
            }, 600);
        }
    };

    return (
        <div className="absolute inset-0 overflow-hidden touch-none">
            {/* Deck Loading Slot */}
            <div
                className={`absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-48 transition-all duration-300 z-10 pointer-events-none
                    ${isHovering ? 'translate-y-0 opacity-100' : '-translate-y-12 opacity-80'}
                `}
            >
                {/* Visual Chassis */}
                <div className="w-full h-full bg-[#111] rounded-b-xl shadow-2xl border-b-4 border-x-4 flex flex-col items-center justify-end pb-6 relative overflow-hidden"
                    style={{
                        borderColor: 'var(--deck-border)',
                        backgroundColor: 'var(--deck-bg)',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                    }}>

                    {/* Texture Overlay */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'var(--deck-surface-pattern)' }}></div>

                    {/* The Slot Opening */}
                    <div className={`w-3/4 h-24 bg-black rounded shadow-[inset_0_5px_10px_rgba(0,0,0,1)] border-t-2 border-stone-800 flex items-center justify-center relative overflow-hidden transition-all duration-300 ${isHovering ? 'scale-[1.02] border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.2)]' : ''}`}>

                        {/* Mechanical Doors */}
                        <div className={`absolute inset-x-0 top-0 h-1/2 bg-[#1a1a1a] border-b border-[#333] z-0 transition-transform duration-300 ${isHovering ? '-translate-y-full' : 'translate-y-0'}`}></div>
                        <div className={`absolute inset-x-0 bottom-0 h-1/2 bg-[#1a1a1a] border-t border-[#333] z-0 transition-transform duration-300 ${isHovering ? 'translate-y-full' : 'translate-y-0'}`}></div>

                        {/* Inner Chamber (Visible when open) */}
                        <div className="absolute inset-0 bg-[#050505] flex items-center justify-center opacity-50">
                            <div className="w-full h-1 bg-stone-800 rotate-45"></div>
                            <div className="w-full h-1 bg-stone-800 -rotate-45 absolute"></div>
                        </div>

                        <div className={`z-20 font-mono text-xs tracking-[0.3em] font-bold transition-all duration-300 ${isHovering ? 'text-green-500 scale-110' : 'text-stone-600'}`}>
                            {isHovering ? 'RELEASE TO LOAD' : 'INSERT CASSETTE'}
                        </div>
                    </div>

                    {/* Screws */}
                    <div className="absolute top-4 left-4 w-4 h-4 rounded-full bg-[#222] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] flex items-center justify-center"><div className="w-full h-px bg-[#000] rotate-45"></div></div>
                    <div className="absolute top-4 right-4 w-4 h-4 rounded-full bg-[#222] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] flex items-center justify-center"><div className="w-full h-px bg-[#000] rotate-12"></div></div>
                </div>
            </div>

            {bodies.map(body => {
                const playlist = playlists.find(p => p.id === body.id);
                if (!playlist) return null;

                const isLoading = loadingId === playlist.id;
                const targetX = (window.innerWidth / 2) - (body.width / 2);

                return (
                    <div
                        key={body.id}
                        onPointerDown={(e) => !isLoading && onPointerDown(body.id, e)}
                        onPointerUp={(e) => !isLoading && handlePointerUp(e, body, playlist)}
                        className={`absolute will-change-transform shadow-2xl 
                            ${isLoading ? 'transition-all duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)]' : 'cursor-grab active:cursor-grabbing'}`}
                        style={{
                            transform: isLoading
                                ? `translate(${targetX}px, 60px) rotate(0deg) scale(0.9)`
                                : `translate(${body.x}px, ${body.y}px) rotate(${body.rotation}deg)`,
                            width: `${body.width}px`,
                            zIndex: isLoading ? 5 : (body.isDragging ? 100 : 1)
                        }}
                    >
                        {/* We scale the tape down a bit to fit more on screen */}
                        <div className="transform scale-75 origin-top-left pointer-events-none">
                            {/* pointer-events-none on child ensures drag is handled by parent div */}
                            <CassetteTape playlist={playlist} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
