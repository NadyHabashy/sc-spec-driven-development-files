import type { Db } from './db/connection.js'

// Shared per-request context, set once in createApp and read with c.var.
export type AppEnv = {
  Variables: {
    db: Db
    now: () => Date
  }
}
