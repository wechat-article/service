import { app } from 'electron'
import { ChildProcessWithoutNullStreams, spawn } from 'node:child_process'
import path from 'node:path'
import { log } from './logger'
import mitm from '../../resources/mitm/mitm?asset&asarUnpack'
import plugin from '../../resources/credential.py?asset&asarUnpack'

export const credentialJsonPath = path.join(app.getPath('userData'), 'credentials.json')

export class MitmproxyManager {
  private static _process: ChildProcessWithoutNullStreams | null = null
  private static _port: number | null = null

  static get port(): number | null {
    return this._port
  }

  // 启动 mitmproxy 代理进程
  static async startup(port = 18080, retry = 5): Promise<number> {
    if (this._process && this.port) {
      return this.port
    }

    log('开始启动 mitmproxy 进程，尝试端口:', port)
    log('启动参数: ', {
      bin: mitm,
      plugin: plugin,
      credential: credentialJsonPath
    })

    return new Promise((resolve, reject) => {
      const _process = spawn(mitm, [
        `-s ${plugin}`,
        '-p',
        port.toString(),
        '-f',
        credentialJsonPath
      ])
      _process.stderr.on('data', (data) => {
        log('mitmproxy 启动失败:', data.toString())
        if (retry > 0) {
          this.startup(port + 1, retry - 1).then(resolve, reject)
        } else {
          reject(data)
        }
      })
      _process.stdout.on('data', (data) => {
        const dataStr = data.toString()
        log(dataStr)
        if (dataStr.includes('running success')) {
          resolve(port)
          log('mitmproxy 启动成功，端口:', port)
          this._port = port
          this._process = _process
        }
      })
    })
  }

  // 关闭 mitmproxy 代理进程
  static async close(): Promise<boolean> {
    log('开始关闭 mitmproxy 进程')
    return new Promise((resolve) => {
      if (this._process) {
        this._process.on('exit', () => {
          this._process = null
          this._port = null
          log('mitmproxy 进程关闭成功')
          resolve(true)
        })
        this._process.kill()
      } else {
        log('mitmproxy 进程已不存在')
        resolve(true)
      }
    })
  }
}
