# CASSETTE.OS

> **[📥 DOWNLOAD LATEST WINDOWS APP (.exe)](https://github.com/Adisama404/Cassette-os/raw/main/dist_electron/Cassette%20OS%20Setup%200.0.0.exe)**
>
> *Warning: This is an Alpha release.*

The high-fidelity desktop experience for Cassette.OS.


## Features
- **Native File System**: Drag-and-drop or use system dialogs to add music.
- **Offline First**: Plays local files directly from disk (`file://`).
- **Media Keys**: Global shortcuts (Play/Pause, Next, Prev) work even when app is minimized.
- **System Tray**: Minimize to tray to keep music playing in background.
- **Power Save**: Prevents system sleep while music is playing.

## Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Desktop Mode**:
   ```bash
   npm run desktop
   ```
   *This starts the Vite dev server and launches Electron.*

## Packaging (Building for Production)

To create installers for your OS (Windows .exe, Mac .dmg, Linux .AppImage):

```bash
npm run package
```

Artifacts will be output to `dist_electron/`.

## Architecture
- **Main Process**: `electron/main.js` (Window, IPC, Tray)
- **Preload**: `electron/preload.js` (Context Bridge)
- **Renderer**: `src/*` (React App)
- **Data**: Uses `electron-store` for window state persistence.
