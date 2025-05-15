import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import {
  checkCertificateExists,
  findIndexHtmlFiles,
  generatePDf,
  startFileServer,
  startMitmProxy,
  stopMitmProxy,
  verifyMitmproxy
} from './utils'
import { getSystemProxy } from 'os-proxy-config'
import { MitmproxyManager } from './mitmproxy-manager'
import { CredentialWatcher } from './credential-watcher'

export function handleIPC(): void {
  // 选择目录
  ipcMain.handle('dialog:open', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    const { canceled, filePaths } = await dialog.showOpenDialog(win!, {
      title: '选择 HTML 文件根目录',
      properties: ['openDirectory']
    })
    if (!canceled) {
      return filePaths[0]
    }
    return null
  })

  // 查询 html 文件
  ipcMain.handle('query:html-files', async (_, dir) => {
    return findIndexHtmlFiles(dir)
  })

  // 启动文件服务器
  ipcMain.handle('start:file-server', async (_, dir) => {
    const server = await startFileServer(dir)
    const port = (server.address() as { port: number }).port
    return `http://127.0.0.1:${port}/`
  })

  // 生成 pdf 服务
  ipcMain.handle('generate:pdf', async (_, url, outDir) => {
    await generatePDf(url, outDir)
  })

  // 查询系统代理配置
  ipcMain.handle('get-system-proxy', async () => {
    return await getSystemProxy()
  })
  // 启动 mitmproxy 进程
  ipcMain.handle('start-mitmproxy', async () => {
    return startMitmProxy()
  })
  // 关闭 mitmproxy 进程
  ipcMain.handle('stop-mitmproxy', async () => {
    return stopMitmProxy()
  })
  ipcMain.handle('get-mitmproxy-port', () => {
    return MitmproxyManager.port
  })
  ipcMain.handle('get-ws-port', () => {
    return CredentialWatcher.port
  })
  ipcMain.handle('get-ws-clients', () => {
    return CredentialWatcher.clients
  })
  ipcMain.handle('get-app-version', () => {
    return app.getVersion()
  })
  ipcMain.handle('verify-mitmproxy', async () => {
    return verifyMitmproxy()
  })
  ipcMain.handle('check-certificate-exists', async () => {
    return checkCertificateExists()
  })
}
