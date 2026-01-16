const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    platform: process.platform,

    // File System
    selectFiles: () => ipcRenderer.invoke('dialog:selectFiles'),

    // Window Management
    minimizeToTray: () => ipcRenderer.send('app:minimize'),
    setPlaybackState: (isPlaying) => ipcRenderer.send('app:playback-state', isPlaying),

    // Events
    onMediaKey: (callback) => {
        const handler = (_event, key) => callback(key);
        ipcRenderer.on('media-key', handler);
        return () => ipcRenderer.removeListener('media-key', handler);
    }
});
