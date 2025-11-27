const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

// URL de producción desde Railway (configurable mediante variable de entorno)
const RAILWAY_FRONTEND_URL = process.env.RAILWAY_FRONTEND_URL || 'https://punto-de-venta-frontend.up.railway.app';

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
      webSecurity: true, // Habilitar seguridad web
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
    // En producción, cargar desde Railway
    console.log(`Cargando aplicación desde: ${RAILWAY_FRONTEND_URL}`);
    mainWindow.loadURL(RAILWAY_FRONTEND_URL).catch((error) => {
      console.error('Error al cargar desde Railway:', error);
      // Fallback: intentar cargar desde archivos locales si Railway falla
      console.log('Intentando cargar desde archivos locales como fallback...');
      mainWindow.loadFile(path.join(__dirname, '../dist/index.html')).catch((fallbackError) => {
        console.error('Error al cargar archivos locales:', fallbackError);
      });
    });
  }

  // Manejar cierre de ventana
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Prevenir navegación a URLs externas (excepto Railway en producción)
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    if (!isDev) {
      const parsedUrl = new URL(navigationUrl);
      const railwayUrl = new URL(RAILWAY_FRONTEND_URL);
      
      // Permitir navegación dentro de Railway o archivos locales
      const isRailwayUrl = parsedUrl.hostname === railwayUrl.hostname;
      const isLocalFile = parsedUrl.protocol.startsWith('file:');
      
      if (!isRailwayUrl && !isLocalFile) {
        event.preventDefault();
        console.warn('Navegación bloqueada a:', navigationUrl);
      }
    }
  });

  // Manejar enlaces externos (abrir en navegador por defecto)
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (!isDev) {
      const parsedUrl = new URL(url);
      const railwayUrl = new URL(RAILWAY_FRONTEND_URL);
      
      // Permitir abrir enlaces dentro de Railway
      if (parsedUrl.hostname === railwayUrl.hostname) {
        return { action: 'allow' };
      }
    }
    
    // Abrir enlaces externos en el navegador del sistema
    require('electron').shell.openExternal(url);
    return { action: 'deny' };
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

