const { app, BrowserWindow } = require('electron');
const contextMenu = require('electron-context-menu');

contextMenu({
	prepend: (defaultActions, params, browserWindow) => [
		{
			label: 'Rainbow',
			// Only show it when right-clicking images
			visible: params.mediaType === 'image'
		},
	]
});

function createWindow () {

  const windowStateKeeper = require('electron-window-state');

  let mainWindowState = windowStateKeeper({
    defaultWidth: 1024,
    defaultHeight: 600
  });
  // Create the browser window.
  let win = new BrowserWindow({
    devTools: true,
    show: false,
    backgroundColor: "#fff",
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    frame: false,
    titleBarStype: "inset",
    minWidth: 1024,
    minHeight: 600,
    webPreferences: {
      enableRemoteModule: true,
      contextIsolation: false,
      nodeIntegration: true,
      spellcheck: true
    }
  })

  mainWindowState.manage(win);

  win.once('ready-to-show', () => {
    win.show()
  })

  // and load the index.html of the app.
  win.loadFile('write.html')
}
app.whenReady().then(createWindow)
