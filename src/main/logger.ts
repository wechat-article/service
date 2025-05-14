import fs from 'node:fs'
import util from 'node:util'
import os from 'node:os'
import path from 'node:path'
import { app } from 'electron'
import dayjs from 'dayjs'

const dataPath = app.getPath('userData')
const logsRoot = path.join(dataPath, 'logs')
if (!fs.existsSync(logsRoot)) {
  fs.mkdirSync(logsRoot)
}

function stamp(): string {
  return dayjs().format('YYYY-MM-DD HH:mm:ss')
}

type LogArgs = string | number | boolean | undefined | null | string[] | Error | object

function logger(logfile: string): (...args: LogArgs[]) => void {
  const fileout = fs.openSync(logfile, 'a')
  const stdout = process.stdout

  stdout.on('error', (e) => {
    console.error('[logger] stdout error:', e)
  })

  const fn = function (...args: LogArgs[]): void {
    // 对象序列化
    const parameter = args.map((arg) => {
      if (typeof arg === 'object') {
        return JSON.stringify(arg)
      } else {
        return arg
      }
    })
    const data = stamp() + ' ' + util.format.apply(null, parameter) + os.EOL

    try {
      fs.writeSync(fileout, data)
      stdout.write(data)
    } catch (e) {
      console.error('[logger] write error:', e)
    }
  }
  fn.end = function () {
    fs.closeSync(fileout)
  }

  return fn
}

export const log = logger(path.join(logsRoot, `wxdown-${dayjs().format('YYYY-MM')}.log`))
