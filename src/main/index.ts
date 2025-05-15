import {
  app,
  BrowserWindow,
  Menu,
  MenuItem,
  shell,
  Tray,
  MenuItemConstructorOptions
} from 'electron'
import { join } from 'path'
import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import icon from '../../resources/logo.png?asset'
import trayRedIcon from '../../resources/red.png?asset'
import trayGreenIcon from '../../resources/green.png?asset'
import { handleIPC, stopMitmProxy, startMitmProxy } from './ipc'
import { cleanup } from './utils'
import { log } from './logger'

function createWindow(): BrowserWindow {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    icon: icon,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local HTML file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
  return mainWindow
}

let tray: Tray | null = null
let menu: Menu | null = null

app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // See https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // 处理 IPC 消息
  handleIPC()

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })

  tray = new Tray(trayRedIcon)

  menu = Menu.buildFromTemplate([
    {
      id: 'proxyStatus',
      label: '状态: 关闭',
      enabled: false
    },
    { type: 'separator' },
    {
      id: 'startProxy',
      label: '开启',
      enabled: true,
      click: async function () {
        await startMitmProxy()
      }
    },
    {
      id: 'stopProxy',
      label: '关闭',
      enabled: false,
      click: async () => {
        await stopMitmProxy()
      }
    },
    { type: 'separator' },
    {
      label: '显示',
      click: () => {
        const wins = BrowserWindow.getAllWindows()
        if (wins.length === 0) {
          createWindow()
        } else {
          wins[0].show()
        }
      }
    },
    {
      label: '打开开发者工具',
      click: () => {
        const win = BrowserWindow.getAllWindows()[0]
        win.webContents.openDevTools({ mode: 'detach' })
      }
    },
    {
      label: '退出',
      role: 'quit',
      accelerator: 'CommandOrControl+Q'
    }
  ])

  tray.setContextMenu(menu)
})

export function onMitmproxyStart() {
  if (!menu || !tray) {
    return
  }
  tray!.setImage(trayGreenIcon)

  // 获取当前菜单项并更新
  const updatedMenuItems: (MenuItemConstructorOptions | MenuItem)[] = menu.items.map((item) => ({
    ...item,
    label: item.id === 'proxyStatus' ? '代理状态: 开启' : item.label,
    enabled: item.id === 'startProxy' ? false : item.id === 'stopProxy' ? true : item.enabled
  }))
  menu = Menu.buildFromTemplate(updatedMenuItems)

  tray.setContextMenu(menu)
}
export function onMitmproxyStop() {
  if (!menu || !tray) {
    return
  }
  tray!.setImage(trayRedIcon)

  // 获取当前菜单项并更新
  const updatedMenuItems: (MenuItemConstructorOptions | MenuItem)[] = menu.items.map((item) => ({
    ...item,
    label: item.id === 'proxyStatus' ? '代理状态: 关闭' : item.label,
    enabled: item.id === 'startProxy' ? true : item.id === 'stopProxy' ? false : item.enabled
  }))
  menu = Menu.buildFromTemplate(updatedMenuItems)

  tray.setContextMenu(menu)
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // 有托盘，所以不需要退出
    // app.quit()
  }
})

let cleaned = false
app.on('before-quit', async (event) => {
  if (!cleaned) {
    event.preventDefault()
    await cleanup()
    cleaned = true
    process.exit(0)
  }
})

// 处理异常后关闭子进程
process.on('uncaughtException', async (err) => {
  log('未捕获的异常:', err)
  await cleanup()
})
