import type { Ref } from '../db/types.js'
import { Layout } from '../layout.js'
import type { BookingErrors, BookingField, BookingValues } from './schema.js'
import { SLOTS } from './slots.js'

export type SlotState = 'free' | 'taken' | 'past'
export type SlotAvailability = readonly { slot: string; state: SlotState }[]

const stateLabels: Record<SlotState, string> = { free: '', taken: ' (taken)', past: ' (past)' }

export type SlotOptionsProps = {
  selected: string
  // Without availability (no JavaScript), every slot is offered and the server
  // rejects a taken one on submit.
  availability?: SlotAvailability
}

// The slot <select>'s options. Also served alone to htmx when the date changes.
export const SlotOptions = ({ selected, availability }: SlotOptionsProps) => (
  <>
    <option value="">Choose a time</option>
    {(availability ?? SLOTS.map((slot) => ({ slot, state: 'free' as const }))).map(
      ({ slot, state }) => (
        <option
          value={slot}
          disabled={state !== 'free'}
          selected={state === 'free' && slot === selected}
        >
          {slot}
          {stateLabels[state]}
        </option>
      ),
    )}
  </>
)

const labels: Record<BookingField, string> = {
  agentId: 'Agent',
  therapyId: 'Therapy',
  date: 'Date',
  slot: 'Time',
  notes: 'Notes (optional)',
}

// aria attributes linking an invalid control to its message.
const invalid = (field: BookingField, errors: BookingErrors) =>
  errors[field] ? { 'aria-invalid': 'true', 'aria-describedby': `${field}-error` } : {}

const FieldError = ({ field, errors }: { field: BookingField; errors: BookingErrors }) =>
  errors[field] ? <small id={`${field}-error`}>{errors[field]}</small> : null

export type BookingPageProps = {
  agents: readonly Ref[]
  therapies: readonly Ref[]
  values: BookingValues
  errors: BookingErrors
  today: string
}

export const BookingPage = ({ agents, therapies, values, errors, today }: BookingPageProps) => {
  const invalidFields = (Object.keys(labels) as BookingField[]).filter((field) => errors[field])

  return (
    <Layout
      title="Book an appointment · AgentClinic"
      currentPath="/appointments/new"
      scripts={['/htmx.min.js']}
    >
      <h1>Book an appointment</h1>
      <p>Pick a therapy and a time. We'll keep the couch warm.</p>

      {invalidFields.length > 0 && (
        <article class="error-summary" role="alert" aria-labelledby="error-summary-title">
          <h2 id="error-summary-title">
            Please fix {invalidFields.length === 1 ? 'this' : 'these'}
          </h2>
          <ul>
            {invalidFields.map((field) => (
              <li>
                <a href={`#${field}`}>
                  {labels[field]}: {errors[field]}
                </a>
              </li>
            ))}
          </ul>
        </article>
      )}

      <form method="post" action="/appointments" novalidate>
        <label for="agentId">{labels.agentId}</label>
        <select id="agentId" name="agentId" required {...invalid('agentId', errors)}>
          <option value="">Choose an agent</option>
          {agents.map((agent) => (
            <option value={String(agent.id)} selected={String(agent.id) === values.agentId}>
              {agent.name}
            </option>
          ))}
        </select>
        <FieldError field="agentId" errors={errors} />

        <label for="therapyId">{labels.therapyId}</label>
        <select id="therapyId" name="therapyId" required {...invalid('therapyId', errors)}>
          <option value="">Choose a therapy</option>
          {therapies.map((therapy) => (
            <option value={String(therapy.id)} selected={String(therapy.id) === values.therapyId}>
              {therapy.name}
            </option>
          ))}
        </select>
        <FieldError field="therapyId" errors={errors} />

        <div class="grid-fields">
          <div>
            <label for="date">{labels.date}</label>
            <input
              type="date"
              id="date"
              name="date"
              min={today}
              value={values.date}
              required
              hx-get="/appointments/slots"
              hx-trigger="load, change"
              hx-target="#slot"
              hx-include="#slot"
              {...invalid('date', errors)}
            />
            <FieldError field="date" errors={errors} />
          </div>
          <div>
            <label for="slot">{labels.slot}</label>
            <select id="slot" name="slot" required {...invalid('slot', errors)}>
              <SlotOptions selected={values.slot} />
            </select>
            <FieldError field="slot" errors={errors} />
          </div>
        </div>

        <label for="notes">{labels.notes}</label>
        <textarea id="notes" name="notes" rows={3} maxlength={500} {...invalid('notes', errors)}>
          {values.notes}
        </textarea>
        <FieldError field="notes" errors={errors} />

        <button type="submit">Book appointment</button>
      </form>
    </Layout>
  )
}
