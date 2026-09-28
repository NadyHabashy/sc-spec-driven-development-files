import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as {
  scripts?: Record<string, string>
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

describe('package.json', () => {
  it.each(['@picocss/pico', 'better-sqlite3', 'zod', 'htmx.org'])(
    'lists %s as a runtime dependency',
    (name) => {
      expect(pkg.dependencies).toHaveProperty(name)
    },
  )

  it('has db:migrate and db:seed scripts', () => {
    expect(pkg.scripts).toHaveProperty('db:migrate')
    expect(pkg.scripts).toHaveProperty('db:seed')
  })

  it.each(['prettier', 'eslint', '@eslint/js', 'typescript-eslint'])(
    'lists %s as a dev dependency',
    (name) => {
      expect(pkg.devDependencies).toHaveProperty(name)
    },
  )

  it('lints with ESLint and checks formatting with Prettier', () => {
    expect(pkg.scripts?.lint).toMatch(/\beslint\b/)
    expect(pkg.scripts?.lint).toMatch(/\bprettier --check\b/)
    expect(pkg.scripts?.format).toMatch(/\bprettier --write\b/)
  })

  it('runs lint as part of validate', () => {
    expect(pkg.scripts?.validate).toMatch(/\bnpm run lint\b/)
  })
})
