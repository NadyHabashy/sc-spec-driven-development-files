import { SeverityLabel } from '../components/severity.js'
import { Layout } from '../layout.js'
import type { AilmentWithLinks } from './queries.js'

export type AilmentsPageProps = { ailments: readonly AilmentWithLinks[] }

export const AilmentsPage = ({ ailments }: AilmentsPageProps) => (
  <Layout title="Ailments · AgentClinic" currentPath="/ailments">
    <h1>Ailments</h1>
    <p>A field guide to what ails the modern AI agent. No judgment, only diagnosis.</p>
    {ailments.length === 0 ? (
      <p>No ailments on file. Either everyone is fine, or nobody is admitting it.</p>
    ) : (
      <div class="card-grid">
        {ailments.map((ailment) => (
          <article id={`ailment-${ailment.id}`}>
            <h2>{ailment.name}</h2>
            <p>
              <strong>Severity:</strong> <SeverityLabel severity={ailment.severity} />
            </p>
            <p>{ailment.description}</p>

            <h3>Patients</h3>
            {ailment.agents.length === 0 ? (
              <p>No current patients. Knock on wood.</p>
            ) : (
              <ul>
                {ailment.agents.map((agent) => (
                  <li>
                    <a href={`/agents/${agent.id}`}>{agent.name}</a>
                  </li>
                ))}
              </ul>
            )}

            <h3>Treated by</h3>
            {ailment.therapies.length === 0 ? (
              <p>No known cure (yet). Our researchers are on it.</p>
            ) : (
              <ul>
                {ailment.therapies.map((therapy) => (
                  <li>
                    <a href={`/therapies#therapy-${therapy.id}`}>{therapy.name}</a>
                  </li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </div>
    )}
  </Layout>
)
