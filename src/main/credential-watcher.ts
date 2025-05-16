import WebSocket from 'ws'
import fs from 'node:fs'
import { BrowserWindow } from 'electron'
import { log } from './logger'
import { credentialJsonPath } from './mitmproxy-manager'
import { parseCredentialData, readFileContent } from './utils'

export class CredentialWatcher {
  private static _port: number | null = null
  private static _clients: Set<WebSocket> = new Set()
  private static _file: string = credentialJsonPath
  private static _lastFileContent: string | null = null

  static get port(): number | null {
    return this._port
  }

  static get clients(): number {
    return this._clients.size
  }

  static async listen(): Promise<void> {
    if (this.port) {
      return
    }
    if (!fs.existsSync(this._file)) {
      fs.writeFileSync(this._file, JSON.stringify([]))
    }

    // 创建WebSocket服务器
    const server = new WebSocket.Server({ port: 0 }, () => {
      const { port } = server.address() as { port: number }
      this._port = port
      log(`WebSocket server is running on ws://localhost:${port}`)
    })

    // 监听客户端连接
    server.on('connection', async (ws) => {
      this._clients.add(ws)

      try {
        const data = await readFileContent(this._file)
        ws.send(data)
      } catch (e) {}

      // 监听客户端断开连接
      ws.on('close', () => {
        this._clients.delete(ws)
      })
    })
    server.on('close', () => {
      this._port = null
      this._clients.clear()
    })

    // 监控 credentials.json 文件的内容变化
    fs.watch(this._file, async (event) => {
      if (event === 'change') {
        try {
          const data = await readFileContent(this._file)

          // 检查文件内容是否真的变动
          if (data !== this._lastFileContent) {
            this._lastFileContent = data
            log(`${this._file} file has changed.`)

            // 通知所有连接的客户端
            this.notify(data)
          }
        } catch (e) {}
      }
    })

    setInterval(async () => {
      try {
        const data = await readFileContent(this._file)
        // 通知所有连接的客户端
        this.notify(data)
      } catch (e) {}
    }, 3000)
  }

  private static notify(data: string): void {
    const credentials = parseCredentialData(data)

    this._clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(credentials)
      }
    })

    BrowserWindow.getAllWindows().forEach((win) => {
      win.webContents.send('update:credentials', credentials)
    })
  }
}
