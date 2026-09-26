import { Nav } from './nav.js'

export const Header = ({ currentPath }: { currentPath: string }) => (
  <header class="container">
    <Nav currentPath={currentPath} />
  </header>
)
