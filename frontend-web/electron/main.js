const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

// Deshabilitar sandbox en Linux para desarrollo (evita error de permisos)
if (process.platform === 'linux' && isDev) {
  app.commandLine.appendSwitch('--no-sandbox');
  app.commandLine.appendSwitch('--disable-setuid-sandbox');
}

let mainWindow;

function createWindow() {
  // Crear ventana del navegador
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    fullscreen: true, // Modo kiosco para tablet
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      sandbox: false, // Deshabilitar sandbox para Linux (solo desarrollo)
    },
    icon: path.join(__dirname, '../public/icon.png'), // Opcional: icono de la app
  });

  // Cargar app web o local
  if (isDev) {
    // En desarrollo, cargar desde Vite dev server
    // Vite puede usar diferentes puertos (5173, 5174, 5175, etc.)
    // Intentar cargar y si falla, esperar un momento y reintentar
    const tryLoad = () => {
      const ports = [5173, 5174, 5175, 5176];
      let currentPort = 0;
      
      const attemptLoad = () => {
        if (currentPort < ports.length) {
          const port = ports[currentPort];
          console.log(`Intentando cargar desde puerto ${port}...`);
          mainWindow.loadURL(`http://localhost:${port}`).catch(() => {
            currentPort++;
            setTimeout(attemptLoad, 1000);
          });
        } else {
          console.error('No se pudo conectar a ningún puerto de Vite');
        }
      };
      
      attemptLoad();
    };
    
    tryLoad();
    
    // Abrir DevTools en desarrollo
    mainWindow.webContents.openDevTools();
  } else {
    // En producción, cargar desde archivos locales
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Manejar cierre de ventana
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Prevenir navegación a URLs externas
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    if (!isDev) {
      const parsedUrl = new URL(navigationUrl);
      // Permitir solo archivos locales en producción
      if (!parsedUrl.protocol.startsWith('file:')) {
        event.preventDefault();
      }
    }
  });
}

// Este método se llamará cuando Electron haya terminado de inicializarse
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // En macOS es común recrear una ventana cuando se hace clic en el icono
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Salir cuando todas las ventanas estén cerradas, excepto en macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Manejar errores no capturados
process.on('uncaughtException', (error) => {
  console.error('Error no capturado:', error);
});

