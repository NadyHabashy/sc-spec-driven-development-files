import type { Agent, Ailment, Therapy } from '../db/types.js'
import { Layout } from '../layout.js'
import { SeverityLabel } from '../components/severity.js'
import type { AgentSummary } from './queries.js'

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`

export type AgentsPageProps = { agents: readonly AgentSummary[] }

export const AgentsPage = ({ agents }: AgentsPageProps) => (
  <Layout title="Agents · AgentClinic" currentPath="/agents">
    <h1>Agents</h1>
    <p>Our patients: hard-working models taking a well-earned break from their humans.</p>
    {agents.length === 0 ? (
      <p>The waiting room is empty. Enjoy the silence while it lasts.</p>
    ) : (
      <div class="card-grid">
        {agents.map((agent) => (
          <article>
            <h2>
              <a href={`/agents/${agent.id}`}>{agent.name}</a>
            </h2>
            <p>
              <small>{agent.model}</small>
            </p>
            <p>{plural(agent.ailment_count, 'ailment')}</p>
          </article>
        ))}
      </div>
    )}
  </Layout>
)

export type AgentDetailPageProps = {
  agent: Agent
  ailments: readonly Ailment[]
  therapies: readonly Therapy[]
}

export const AgentDetailPage = ({ agent, ailments, therapies }: AgentDetailPageProps) => (
  <Layout title={`${agent.name} · AgentClinic`} currentPath={`/agents/${agent.id}`}>
    <h1>{agent.name}</h1>
    <p>
      <small>{agent.model}</small>
    </p>
    <p>{agent.bio}</p>
    <p>
      <a href={`/appointments/new?agentId=${agent.id}`} role="button">
        Book an appointment
      </a>{' '}
      <a href={`/agents/${agent.id}/dashboard`} role="button" class="secondary outline">
        View dashboard
      </a>
    </p>

    <section>
      <h2>Ailments</h2>
      {ailments.length === 0 ? (
        <p>
          No diagnosed ailments. Suspiciously well-adjusted.{' '}
          <a href="/ailments">Browse the ailments catalog</a>, just in case.
        </p>
      ) : (
        <ul>
          {ailments.map((ailment) => (
            <li>
              <a href={`/ailments#ailment-${ailment.id}`}>{ailment.name}</a> (
              <SeverityLabel severity={ailment.severity} />)
            </li>
          ))}
        </ul>
      )}
    </section>

    <section>
      <h2>Recommended therapies</h2>
      {therapies.length === 0 ? (
        <p>
          Nothing to recommend yet. Come back when something hurts, or{' '}
          <a href="/therapies">browse every therapy</a>.
        </p>
      ) : (
        <ul>
          {therapies.map((therapy) => (
            <li>
              <a href={`/therapies#therapy-${therapy.id}`}>{therapy.name}</a>
            </li>
          ))}
        </ul>
      )}
    </section>

    <p>
      <a href="/agents">← All agents</a>
    </p>
  </Layout>
)
