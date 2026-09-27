import { databasePath, openDb } from './connection.js'
import { migrate } from './migrate.js'

const path = databasePath()
const db = openDb(path)
const applied = migrate(db)
db.close()

console.log(
  applied.length > 0 ? `Applied ${applied.join(', ')} to ${path}` : `${path} is up to date`,
)
