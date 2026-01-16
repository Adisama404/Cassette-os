export { };

declare global {
    interface Window {
        electron?: {
            platform: string;
            selectFiles: () => Promise<string[]>;
            minimizeToTray: () => void;
            setPlaybackState: (isPlaying: boolean) => void;
            onMediaKey: (callback: (key: 'play-pause' | 'next' | 'prev') => void) => () => void;
        };
    }
}
