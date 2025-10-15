const { app, BrowserWindow, ipcMain, dialog, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs');
const YouTubeAudioDownloader = require('./youtube-downloader-standalone');

let mainWindow;
let ytDownloader;
let registeredShortcuts = [];

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#ffffff',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'assets', 'icon.png'),
  });

  mainWindow.loadFile('index.html');

  // Abrir DevTools apenas em desenvolvimento
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  ytDownloader = new YouTubeAudioDownloader();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC Handlers
ipcMain.handle('select-audio-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Audio Files', extensions: ['mp3', 'wav', 'ogg', 'flac', 'm4a'] },
    ],
  });

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

// Salvar/carregar configurações
const configPath = path.join(app.getPath('userData'), 'config.json');

ipcMain.handle('save-config', async (event, config) => {
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('load-config', async () => {
  try {
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error('Error loading config:', error);
    return null;
  }
});

// YouTube handlers
ipcMain.handle('download-youtube-audio', async (event, url) => {
  try {
    const result = await ytDownloader.downloadAudio(url, (progress) => {
      event.sender.send('youtube-progress', progress);
    });
    return { success: true, path: result.path, title: result.title };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('list-youtube-audios', async () => {
  try {
    const audios = ytDownloader.listYouTubeAudios();
    return { success: true, audios };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('delete-youtube-audio', async (event, filename) => {
  try {
    const deleted = ytDownloader.deleteYouTubeAudio(filename);
    return { success: deleted };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Cleanup on app quit
app.on('before-quit', () => {
  if (ytDownloader) {
    ytDownloader.cleanupOldFiles();
  }
  
  // Unregister all global shortcuts
  globalShortcut.unregisterAll();
});

// Register global shortcuts
ipcMain.handle('register-global-shortcuts', async (event, sounds) => {
  try {
    // Unregister previous shortcuts
    registeredShortcuts.forEach(accelerator => {
      globalShortcut.unregister(accelerator);
    });
    registeredShortcuts = [];
    
    // Register new shortcuts
    sounds.forEach(sound => {
      if (sound.hotkey) {
        // Convert hotkey format to Electron accelerator format
        const accelerator = convertHotkeyToAccelerator(sound.hotkey);
        
        if (accelerator) {
          const registered = globalShortcut.register(accelerator, () => {
            mainWindow.webContents.send('trigger-hotkey', sound.id);
          });
          
          if (registered) {
            registeredShortcuts.push(accelerator);
          }
        }
      }
    });
    
    return { success: true, registered: registeredShortcuts.length };
  } catch (error) {
    console.error('Error registering shortcuts:', error);
    return { success: false, error: error.message };
  }
});

// Convert hotkey format (Ctrl+Alt+A) to Electron accelerator (CommandOrControl+Alt+A)
function convertHotkeyToAccelerator(hotkey) {
  if (!hotkey) return null;
  
  try {
    // Replace Ctrl with CommandOrControl for cross-platform compatibility
    let accelerator = hotkey.replace('Ctrl', 'CommandOrControl');
    
    // Convert Num1-Num9 to num1-num9 (Electron format for numpad)
    accelerator = accelerator.replace(/Num(\d)/g, 'num$1');
    
    // Numpad keys without modifiers need special handling
    if (accelerator.match(/^num\d$/)) {
      return accelerator;
    }
    
    return accelerator;
  } catch (error) {
    console.error('Error converting hotkey:', hotkey, error);
    return null;
  }
}
