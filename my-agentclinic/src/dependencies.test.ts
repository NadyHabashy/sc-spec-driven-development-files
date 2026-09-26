import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as {
  dependencies?: Record<string, string>
}

describe('package.json', () => {
  it('lists @picocss/pico as a runtime dependency', () => {
    expect(pkg.dependencies).toHaveProperty('@picocss/pico')
  })
})
