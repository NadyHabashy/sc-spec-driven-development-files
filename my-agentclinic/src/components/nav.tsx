export type NavItem = { href: string; label: string }

// Each later phase adds its page's link here when the page ships.
export const navItems: NavItem[] = [{ href: '/', label: 'Home' }]

export const Nav = ({ currentPath }: { currentPath: string }) => (
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
          <a href={href} aria-current={href === currentPath ? 'page' : undefined}>
            {label}
          </a>
        </li>
      ))}
    </ul>
  </nav>
)
