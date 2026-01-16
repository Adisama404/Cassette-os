const { app, BrowserWindow, ipcMain, dialog, globalShortcut, Tray, Menu, powerSaveBlocker } = require('electron');
const path = require('path');
const isDev = !app.isPackaged;
const Store = require('electron-store');
const store = new Store();

let mainWindow;
let tray = null;
let powerSaveId = null;

// Handle power save prevention
ipcMain.on('app:playback-state', (event, isPlaying) => {
    if (isPlaying) {
        if (powerSaveId === null) {
            powerSaveId = powerSaveBlocker.start('prevent-app-suspension');
        }
    } else {
        if (powerSaveId !== null) {
            powerSaveBlocker.stop(powerSaveId);
            powerSaveId = null;
        }
    }
});

function createWindow() {
    const bounds = store.get('windowBounds') || { width: 1200, height: 800 };

    mainWindow = new BrowserWindow({
        width: bounds.width,
        height: bounds.height,
        x: bounds.x,
        y: bounds.y,
        minWidth: 800,
        minHeight: 600,
        backgroundColor: '#0a0a0a',
        show: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'), // Updated to .cjs
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: true,
        },
        autoHideMenuBar: true,
        icon: app.isPackaged
            ? path.join(__dirname, '../dist/icon.png')
            : path.join(__dirname, '../public/icon.png'),
    });

    const startUrl = isDev
        ? 'http://localhost:3000' // Corrected port to 3000 (standard React/Vite default often 5173 but user logs showed 3000 in wait-on command)
        : `file://${path.join(__dirname, '../dist/index.html')}`;

    mainWindow.loadURL(startUrl);

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    const saveBounds = () => {
        store.set('windowBounds', mainWindow.getBounds());
    };
    mainWindow.on('resize', saveBounds);
    mainWindow.on('move', saveBounds);

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('http:') || url.startsWith('https:')) {
            require('electron').shell.openExternal(url);
        }
        return { action: 'deny' };
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    registerMediaShortcuts();
}

function registerMediaShortcuts() {
    globalShortcut.register('MediaPlayPause', () => {
        if (mainWindow) mainWindow.webContents.send('media-key', 'play-pause');
    });
    globalShortcut.register('MediaNextTrack', () => {
        if (mainWindow) mainWindow.webContents.send('media-key', 'next');
    });
    globalShortcut.register('MediaPreviousTrack', () => {
        if (mainWindow) mainWindow.webContents.send('media-key', 'prev');
    });
}

function createTray() {
    const iconPath = app.isPackaged
        ? path.join(__dirname, '../dist/icon.png')
        : path.join(__dirname, '../public/icon.png');
    tray = new Tray(iconPath);
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Show App', click: () => mainWindow.show() },
        {
            label: 'Quit', click: () => {
                app.isQuitting = true;
                app.quit();
            }
        },
    ]);
    tray.setToolTip('Cassette.OS');
    tray.setContextMenu(contextMenu);

    tray.on('double-click', () => {
        mainWindow.show();
    });
}

app.on('ready', () => {
    createWindow();
    createTray();
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

ipcMain.handle('dialog:selectFiles', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile', 'multiSelections'],
        filters: [
            { name: 'Audio', extensions: ['mp3', 'wav', 'ogg', 'm4a', 'flac'] }
        ]
    });
    return result.filePaths;
});

ipcMain.on('app:minimize', () => {
    if (mainWindow) {
        mainWindow.hide();
    }
});
