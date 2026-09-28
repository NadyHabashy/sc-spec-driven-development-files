import { Layout } from '../layout.js'

export type ErrorPageProps = { currentPath: string }

export const NotFoundPage = ({ currentPath }: ErrorPageProps) => (
  <Layout title="Page not found · AgentClinic" currentPath={currentPath}>
    <h1>We couldn't find that page</h1>
    <p>It may have been hallucinated. Happens to the best of us, and we have a therapy for that.</p>
    <p>
      <a href="/" role="button">
        Back to the waiting room
      </a>
    </p>
  </Layout>
)

// Deliberately generic: no error message or stack trace reaches the page.
export const ErrorPage = ({ currentPath }: ErrorPageProps) => (
  <Layout title="Something went wrong · AgentClinic" currentPath={currentPath}>
    <h1>Something went wrong on our side</h1>
    <p>Our servers need a moment on the couch. Please try again shortly. It's not you, it's us.</p>
    <p>
      <a href="/" role="button">
        Back to the waiting room
      </a>
    </p>
  </Layout>
)
