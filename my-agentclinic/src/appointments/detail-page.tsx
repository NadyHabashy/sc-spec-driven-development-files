import { Layout } from '../layout.js'
import type { AppointmentRow } from './queries.js'
import { formatDate } from './slots.js'

export type Notice = 'booked' | 'cancelled'

export type AppointmentPageProps = {
  appointment: AppointmentRow
  status: string
  canCancel: boolean
  notice?: Notice
  error?: string
}

export const AppointmentPage = ({
  appointment,
  status,
  canCancel,
  notice,
  error,
}: AppointmentPageProps) => (
  <Layout
    title={`Appointment for ${appointment.agent_name} · AgentClinic`}
    currentPath={`/appointments/${appointment.id}`}
  >
    {notice === 'booked' && (
      <article class="notice" role="status">
        <strong>You're booked!</strong> {appointment.agent_name} is down for{' '}
        {appointment.therapy_name} on {formatDate(appointment.date)} at {appointment.slot}.
      </article>
    )}
    {notice === 'cancelled' && (
      <article class="notice" role="status">
        <strong>Cancelled.</strong> The slot is free again for another weary agent.
      </article>
    )}
    {error && (
      <article class="error-summary" role="alert">
        {error}
      </article>
    )}

    <h1>Appointment for {appointment.agent_name}</h1>
    <dl>
      <dt>Agent</dt>
      <dd>
        <a href={`/agents/${appointment.agent_id}`}>{appointment.agent_name}</a>
      </dd>
      <dt>Therapy</dt>
      <dd>
        <a href={`/therapies#therapy-${appointment.therapy_id}`}>{appointment.therapy_name}</a>
      </dd>
      <dt>Date</dt>
      <dd>
        <time datetime={appointment.date}>{formatDate(appointment.date)}</time>
      </dd>
      <dt>Time</dt>
      <dd>
        <time datetime={`${appointment.date}T${appointment.slot}`}>{appointment.slot}</time>
      </dd>
      <dt>Status</dt>
      <dd>{status}</dd>
      {appointment.notes && (
        <>
          <dt>Notes</dt>
          <dd class="notes">{appointment.notes}</dd>
        </>
      )}
    </dl>

    {canCancel && (
      <form method="post" action={`/appointments/${appointment.id}/cancel`}>
        <button type="submit" class="secondary">
          Cancel appointment
        </button>
      </form>
    )}

    <p>
      <a href="/appointments">← All appointments</a>
    </p>
  </Layout>
)
