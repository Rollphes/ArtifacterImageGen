import { Response } from 'node-fetch'

type ErrorType = 'APIError' | 'ManagerError'

export class EnkaManagerjsError extends Error {
  type: ErrorType
  status?: string
  url?: string

  constructor(type: ErrorType, msg?: string) {
    super(`[${type}]` + (msg || ''))
    this.type = type
  }

  setResponse(res: Response, msg?: string) {
    this.status = `[${res.status}]` + res.statusText
    this.message = `[${this.type}]` + (msg || '')
    this.url = res.url
  }
}
