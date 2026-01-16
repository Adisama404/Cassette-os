const { app, BrowserWindow, ipcMain, dialog, globalShortcut, Tray, Menu, powerSaveBlocker } = require('electron');

let powerSaveId = null;

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
const path = require('path');
const isDev = require('electron-is-dev');
const Store = require('electron-store');
const store = new Store();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let tray = null;

function createWindow() {
    // Restore window bounds
    const bounds = store.get('windowBounds') || { width: 1200, height: 800 };

    mainWindow = new BrowserWindow({
        width: bounds.width,
        height: bounds.height,
        x: bounds.x,
        y: bounds.y,
        minWidth: 800,
        minHeight: 600,
        backgroundColor: '#0a0a0a', // Match app background to avoid white flash
        show: false, // Don't show until ready-to-show
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: true, // NON-NEGOTIABLE security
        },
        autoHideMenuBar: true,
        icon: path.join(__dirname, '../public/favicon.ico'), // Will need an icon
    });

    // Load the app
    const startUrl = isDev
        ? 'http://localhost:5173'
        : `file://${path.join(__dirname, '../dist/index.html')}`;

    mainWindow.loadURL(startUrl);

    // Smooth startup
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // Save window bounds on resize/move
    const saveBounds = () => {
        store.set('windowBounds', mainWindow.getBounds());
    };
    mainWindow.on('resize', saveBounds);
    mainWindow.on('move', saveBounds);

    // Handle external links (Security Best Practice)
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('http:') || url.startsWith('https:')) {
            require('electron').shell.openExternal(url);
        }
        return { action: 'deny' };
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Register Shortcuts when focused (or global if preferred for music player)
    // For a music app, global shortcuts are standard. 
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

// System Tray
function createTray() {
    const iconPath = path.join(__dirname, '../public/favicon.ico'); // Placeholder
    // Handle different OS icon needs later if necessary
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

// App Lifecycle
app.on('ready', () => {
    createWindow();
    createTray();
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

// IPC Handlers

// Native File Open Dialog
ipcMain.handle('dialog:selectFiles', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile', 'multiSelections'],
        filters: [
            { name: 'Audio', extensions: ['mp3', 'wav', 'ogg', 'm4a', 'flac'] }
        ]
    });
    return result.filePaths;
});

// Minimize to Tray behavior
ipcMain.on('app:minimize', () => {
    if (mainWindow) {
        mainWindow.hide(); // Minimize to tray usually implies hiding
    }
});
