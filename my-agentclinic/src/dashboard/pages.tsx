import type { AppointmentRow } from '../appointments/queries.js'
import { AppointmentsTable } from '../appointments/pages.js'
import { statusLabel } from '../appointments/status.js'
import { SeverityLabel } from '../components/severity.js'
import type { Agent, Ailment, Ref, Therapy } from '../db/types.js'
import { Layout } from '../layout.js'
import type { Counts } from './queries.js'

type StatProps = { value: number; label: string; href: string }

const Stat = ({ value, label, href }: StatProps) => (
  <article class="stat">
    <p class="stat-value">{value}</p>
    <p>
      <a href={href}>{label}</a>
    </p>
  </article>
)

export type StaffDashboardPageProps = {
  now: Date
  counts: Counts
  today: readonly AppointmentRow[]
  agents: readonly Ref[]
}

export const StaffDashboardPage = ({ now, counts, today, agents }: StaffDashboardPageProps) => (
  <Layout title="Dashboard · AgentClinic" currentPath="/dashboard">
    <h1>Staff dashboard</h1>
    <p>Everything the front desk needs, minus the fish tank.</p>

    <section aria-labelledby="glance">
      <h2 id="glance">At a glance</h2>
      <div class="feature-grid">
        <Stat value={counts.today} label="Appointments today" href="#today" />
        <Stat value={counts.upcoming} label="Upcoming" href="/appointments" />
        <Stat value={counts.agents} label="Agents" href="/agents" />
        <Stat value={counts.ailments} label="Ailments" href="/ailments" />
        <Stat value={counts.therapies} label="Therapies" href="/therapies" />
      </div>
    </section>

    <section aria-labelledby="today">
      <h2 id="today">Today</h2>
      {today.length === 0 ? (
        <p>
          No appointments today. The couch is free, and so is the coffee.{' '}
          <a href="/appointments/new">Book an appointment</a>.
        </p>
      ) : (
        <AppointmentsTable
          caption="Today's appointments"
          appointments={today}
          statusFor={(appointment) => statusLabel(appointment, now)}
        />
      )}
    </section>

    <section aria-labelledby="agent-dashboards">
      <h2 id="agent-dashboards">Agent dashboards</h2>
      {agents.length === 0 ? (
        <p>No agents yet. Business is suspiciously good for the humans.</p>
      ) : (
        <ul>
          {agents.map((agent) => (
            <li>
              <a href={`/agents/${agent.id}/dashboard`}>{agent.name}</a>
            </li>
          ))}
        </ul>
      )}
    </section>
  </Layout>
)

export type AgentDashboardPageProps = {
  agent: Agent
  ailments: readonly Ailment[]
  therapies: readonly Therapy[]
  upcoming: readonly AppointmentRow[]
}

export const AgentDashboardPage = ({
  agent,
  ailments,
  therapies,
  upcoming,
}: AgentDashboardPageProps) => (
  <Layout
    title={`${agent.name}'s dashboard · AgentClinic`}
    currentPath={`/agents/${agent.id}/dashboard`}
  >
    <h1>{agent.name}'s dashboard</h1>
    <p>
      Your corner of the clinic. <a href={`/agents/${agent.id}`}>View your profile</a>
    </p>
    <p>
      <a href={`/appointments/new?agentId=${agent.id}`} role="button">
        Book an appointment
      </a>
    </p>

    <section>
      <h2>My ailments</h2>
      {ailments.length === 0 ? (
        <p>
          Nothing diagnosed. Keep doing whatever it is you're doing, or{' '}
          <a href="/ailments">browse the ailments catalog</a>.
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
          No therapies to recommend. Enjoy the free snacks, or{' '}
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

    <section>
      <h2>Upcoming appointments</h2>
      {upcoming.length === 0 ? (
        <p>
          Nothing booked. Your calendar is as clear as a fresh context window.{' '}
          <a href={`/appointments/new?agentId=${agent.id}`}>Book your first session</a>.
        </p>
      ) : (
        <AppointmentsTable
          caption={`${agent.name}'s upcoming appointments`}
          appointments={upcoming}
        />
      )}
    </section>
  </Layout>
)
