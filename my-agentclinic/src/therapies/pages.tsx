import { Layout } from '../layout.js'
import type { TherapyWithAilments } from './queries.js'

export type TherapiesPageProps = { therapies: readonly TherapyWithAilments[] }

export const TherapiesPage = ({ therapies }: TherapiesPageProps) => (
  <Layout title="Therapies · AgentClinic" currentPath="/therapies">
    <h1>Therapies</h1>
    <p>Evidence-adjacent treatments, each matched to the ailments it soothes.</p>
    {therapies.length === 0 ? (
      <p>The therapy menu is being rewritten. Please hold, and breathe.</p>
    ) : (
      <div class="card-grid">
        {therapies.map((therapy) => (
          <article id={`therapy-${therapy.id}`}>
            <h2>{therapy.name}</h2>
            <p>
              <small>{therapy.duration_minutes} minutes</small>
            </p>
            <p>{therapy.description}</p>
            <h3>Treats</h3>
            {therapy.ailments.length === 0 ? (
              <p>Nothing specific. Good for general well-being.</p>
            ) : (
              <ul>
                {therapy.ailments.map((ailment) => (
                  <li>
                    <a href={`/ailments#ailment-${ailment.id}`}>{ailment.name}</a>
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
