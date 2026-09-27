import { Layout } from '../layout.js'
import type { AppointmentRow } from './queries.js'
import { formatDate } from './slots.js'

// Status is always shown as text, never by color alone.
const statusLabel = (appointment: AppointmentRow, today: string) =>
  appointment.status === 'cancelled'
    ? 'Cancelled'
    : appointment.date < today
      ? 'Completed'
      : 'Booked'

type AppointmentsTableProps = {
  caption: string
  appointments: readonly AppointmentRow[]
  // Shown for past and cancelled appointments, where it varies.
  statusFor?: (appointment: AppointmentRow) => string
}

const AppointmentsTable = ({ caption, appointments, statusFor }: AppointmentsTableProps) => (
  <div class="overflow-auto">
    <table>
      <caption>{caption}</caption>
      <thead>
        <tr>
          <th scope="col">Date</th>
          <th scope="col">Time</th>
          <th scope="col">Agent</th>
          <th scope="col">Therapy</th>
          {statusFor && <th scope="col">Status</th>}
        </tr>
      </thead>
      <tbody>
        {appointments.map((appointment) => (
          <tr>
            <th scope="row">
              <time datetime={appointment.date}>{formatDate(appointment.date)}</time>
            </th>
            <td>
              <time datetime={`${appointment.date}T${appointment.slot}`}>{appointment.slot}</time>
            </td>
            <td>
              <a href={`/agents/${appointment.agent_id}`}>{appointment.agent_name}</a>
            </td>
            <td>
              <a href={`/therapies#therapy-${appointment.therapy_id}`}>
                {appointment.therapy_name}
              </a>
            </td>
            {statusFor && <td>{statusFor(appointment)}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

export type AppointmentsPageProps = {
  today: string
  upcoming: readonly AppointmentRow[]
  pastOrCancelled: readonly AppointmentRow[]
}

export const AppointmentsPage = ({ today, upcoming, pastOrCancelled }: AppointmentsPageProps) => (
  <Layout title="Appointments · AgentClinic" currentPath="/appointments">
    <h1>Appointments</h1>
    <p>Who's on the couch, and when. Please arrive a few tokens early.</p>

    {upcoming.length === 0 ? (
      <p>No upcoming appointments. The therapists are catching up on their own reading.</p>
    ) : (
      <AppointmentsTable caption="Upcoming appointments" appointments={upcoming} />
    )}

    {pastOrCancelled.length > 0 && (
      <details>
        <summary>Past and cancelled appointments ({pastOrCancelled.length})</summary>
        <AppointmentsTable
          caption="Past and cancelled appointments"
          appointments={pastOrCancelled}
          statusFor={(appointment) => statusLabel(appointment, today)}
        />
      </details>
    )}
  </Layout>
)
