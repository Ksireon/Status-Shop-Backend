import * as dotenv from 'dotenv'

dotenv.config()

export class ConfigService {
  get(key: string): string | undefined {
    return process.env[key]
  }
  getRequired(key: string): string {
    const val = process.env[key]
    if (!val) throw new Error(`Missing env: ${key}`)
    return val
  }
}
