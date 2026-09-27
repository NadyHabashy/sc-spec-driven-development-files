import { existsSync } from 'node:fs'
import { isAbsolute } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { databasePath, defaultDatabasePath } from './connection.js'

const projectData = fileURLToPath(new URL('../../data/agentclinic.db', import.meta.url))

describe('databasePath', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it("defaults to the project's data/agentclinic.db, whatever the working directory", () => {
    vi.stubEnv('DATABASE_PATH', '')
    const cwd = process.cwd()
    process.chdir(new URL('.', import.meta.url).pathname)
    try {
      expect(databasePath()).toBe(projectData)
    } finally {
      process.chdir(cwd)
    }
    expect(isAbsolute(defaultDatabasePath)).toBe(true)
    expect(existsSync(new URL('../../package.json', import.meta.url))).toBe(true)
  })

  it('uses DATABASE_PATH when set', () => {
    vi.stubEnv('DATABASE_PATH', '/somewhere/else.db')

    expect(databasePath()).toBe('/somewhere/else.db')
  })
})
