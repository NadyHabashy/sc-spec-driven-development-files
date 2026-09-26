import { Nav } from './nav.js'

export type HeaderProps = { currentPath: string }

export const Header = ({ currentPath }: HeaderProps) => (
  <header class="container">
    <Nav currentPath={currentPath} />
  </header>
)
