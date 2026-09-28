import { databasePath, openDb } from './connection.js'
import { migrate } from './migrate.js'
import { seed } from './seed.js'

const path = databasePath()
const db = openDb(path)
migrate(db)
seed(db)
db.close()

console.log(`Seeded ${path}`)
