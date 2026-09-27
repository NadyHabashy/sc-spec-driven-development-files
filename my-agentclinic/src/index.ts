import { serve } from '@hono/node-server'
import { createApp } from './app.js'
import { databasePath, openDb } from './db/connection.js'
import { migrate } from './db/migrate.js'

const port = Number(process.env.PORT ?? 3000)

const db = openDb(databasePath())
migrate(db)

serve({ fetch: createApp({ db }).fetch, port }, (info) => {
  console.log(`AgentClinic running at http://localhost:${info.port}`)
})
