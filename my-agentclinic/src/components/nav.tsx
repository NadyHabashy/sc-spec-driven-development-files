export type NavItem = { href: string; label: string }

// Each later phase adds its page's link here when the page ships.
export const navItems: readonly NavItem[] = [
  { href: '/', label: 'Home' },
  { href: '/agents', label: 'Agents' },
  { href: '/ailments', label: 'Ailments' },
  { href: '/therapies', label: 'Therapies' },
  { href: '/appointments', label: 'Appointments' },
]

// Home matches only itself; every other item also matches its sub-pages, so
// /agents/3 marks Agents as current.
export const isCurrent = (href: string, currentPath: string) =>
  href === '/' ? currentPath === '/' : currentPath === href || currentPath.startsWith(`${href}/`)

export type NavProps = { currentPath: string }

export const Nav = ({ currentPath }: NavProps) => (
  <nav aria-label="Primary">
    <ul>
      <li>
        <a class="site-name" href="/">
          <strong>AgentClinic</strong>
        </a>
      </li>
    </ul>
    <ul>
      {navItems.map(({ href, label }) => (
        <li>
          <a href={href} aria-current={isCurrent(href, currentPath) ? 'page' : undefined}>
            {label}
          </a>
        </li>
      ))}
    </ul>
  </nav>
)
