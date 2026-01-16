import React, { useState, useMemo, useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { Playlist, CassetteTheme } from '../types';
import { useHaptics } from './useHaptics';

interface TapeShelfLogic {
    playlists: Playlist[];
    filteredPlaylists: Playlist[];
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    contextMenu: { x: number; y: number; playlist: Playlist } | null;
    handleContextMenu: (e: React.MouseEvent, playlist: Playlist) => void;
    handleThemeChange: (theme: CassetteTheme) => void;
    handleDelete: () => void;
    handleEject: () => void;
    setContextMenu: React.Dispatch<React.SetStateAction<{ x: number; y: number; playlist: Playlist } | null>>;
    currentPlaylist: Playlist | null;
}

export const useTapeShelf = (): TapeShelfLogic => {
    const { playlists, updatePlaylist, deletePlaylist, currentPlaylist, eject } = usePlayer();
    const { trigger } = useHaptics();
    const [searchQuery, setSearchQuery] = useState("");
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, playlist: Playlist } | null>(null);

    const filteredPlaylists = useMemo(() =>
        playlists.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())),
        [playlists, searchQuery]);

    // Close context menu on global click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.closest('.context-menu-container')) return;
            setContextMenu(null);
        };
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    const handleContextMenu = (e: React.MouseEvent, playlist: Playlist) => {
        e.preventDefault();
        e.stopPropagation();
        trigger();
        setContextMenu({ x: e.pageX, y: e.pageY, playlist });
    };

    const handleThemeChange = async (theme: CassetteTheme) => {
        if (contextMenu) {
            trigger();
            const updated = { ...contextMenu.playlist, theme };
            await updatePlaylist(updated);
            setContextMenu(prev => prev ? { ...prev, playlist: updated } : null);
        }
    };

    const handleDelete = () => {
        if (contextMenu) {
            if (confirm(`Destroy "${contextMenu.playlist.name}"? This cannot be undone.`)) {
                trigger();
                deletePlaylist(contextMenu.playlist.id);
            }
            setContextMenu(null);
        }
    }

    const handleEject = () => {
        if (contextMenu) {
            trigger();
            eject();
            setContextMenu(null);
        }
    }

    return {
        playlists,
        filteredPlaylists,
        searchQuery,
        setSearchQuery,
        contextMenu,
        handleContextMenu,
        handleThemeChange,
        handleDelete,
        handleEject,
        setContextMenu,
        currentPlaylist
    };
};
