import { Hono, type Context } from 'hono'
import type { AppEnv } from '../env.js'
import { renderPage, renderToString } from '../render.js'
import { parseId } from '../validation/params.js'
import { BookingPage, SlotOptions, type SlotAvailability } from './booking-pages.js'
import { AppointmentPage, type Notice } from './detail-page.js'
import { AppointmentsPage } from './pages.js'
import {
  agentExists,
  agentRefs,
  bookedSlots,
  cancelAppointment,
  createAppointment,
  getAppointment,
  listPastOrCancelled,
  type AppointmentRow,
  listUpcoming,
  therapyExists,
  therapyRefs,
} from './queries.js'
import {
  bookingFields,
  bookingSchema,
  fieldErrors,
  type BookingErrors,
  type BookingValues,
} from './schema.js'
import { hasStarted, isIsoDate, SLOTS, toIsoDate } from './slots.js'
import { statusLabel } from './status.js'

type Ctx = Context<AppEnv>

export const appointmentsRoutes = new Hono<AppEnv>()

const slotTaken = 'That time is already taken. Please pick another slot.'

const renderBooking = (c: Ctx, values: BookingValues, errors: BookingErrors = {}) =>
  renderPage(
    <BookingPage
      agents={agentRefs(c.var.db)}
      therapies={therapyRefs(c.var.db)}
      values={values}
      errors={errors}
      today={toIsoDate(c.var.now())}
    />,
  )

const renderAppointment = (
  c: Ctx,
  appointment: AppointmentRow,
  notice?: Notice,
  error?: string,
) => {
  const now = c.var.now()

  return renderPage(
    <AppointmentPage
      appointment={appointment}
      status={statusLabel(appointment, now)}
      canCancel={
        appointment.status === 'booked' && !hasStarted(appointment.date, appointment.slot, now)
      }
      notice={notice}
      error={error}
    />,
  )
}

const findAppointment = (c: Ctx) => {
  const id = parseId(c.req.param('id'))
  return id === null ? undefined : getAppointment(c.var.db, id)
}

appointmentsRoutes.get('/', (c) => {
  const now = c.var.now()

  return c.html(
    renderPage(
      <AppointmentsPage
        now={now}
        upcoming={listUpcoming(c.var.db, now)}
        pastOrCancelled={listPastOrCancelled(c.var.db, now)}
      />,
    ),
  )
})

appointmentsRoutes.get('/new', (c) => {
  const agentId = parseId(c.req.query('agentId'))
  return c.html(
    renderBooking(c, {
      agentId: agentId === null ? '' : String(agentId),
      therapyId: '',
      date: toIsoDate(c.var.now()),
      slot: '',
      notes: '',
    }),
  )
})

// htmx fragment: the slot <option>s for a date, with taken and past slots
// disabled. An invalid date is a 400, which htmx leaves unswapped.
appointmentsRoutes.get('/slots', (c) => {
  const date = c.req.query('date') ?? ''
  if (!isIsoDate(date)) return c.text('Invalid date', 400)

  const now = c.var.now()
  const taken = bookedSlots(c.var.db, date)
  const availability: SlotAvailability = SLOTS.map((slot) => ({
    slot,
    state: hasStarted(date, slot, now) ? 'past' : taken.has(slot) ? 'taken' : 'free',
  }))

  return c.html(
    renderToString(
      <SlotOptions selected={c.req.query('slot') ?? ''} availability={availability} />,
    ),
  )
})

appointmentsRoutes.post('/', async (c) => {
  const body = await c.req.parseBody()
  const values = Object.fromEntries(
    bookingFields.map((field) => {
      const value = body[field]
      return [field, typeof value === 'string' ? value : '']
    }),
  ) as BookingValues

  const parsed = bookingSchema(c.var.now()).safeParse({
    ...values,
    // An empty select or date means "not chosen", not an empty string to validate.
    agentId: values.agentId || undefined,
    therapyId: values.therapyId || undefined,
    date: values.date || undefined,
    slot: values.slot || undefined,
  })
  if (!parsed.success) return c.html(renderBooking(c, values, fieldErrors(parsed.error)), 400)

  const booking = parsed.data
  const unknown: BookingErrors = {}
  if (!agentExists(c.var.db, booking.agentId)) unknown.agentId = 'Choose an agent from the list.'
  if (!therapyExists(c.var.db, booking.therapyId))
    unknown.therapyId = 'Choose a therapy from the list.'
  if (Object.keys(unknown).length > 0) return c.html(renderBooking(c, values, unknown), 400)

  if (bookedSlots(c.var.db, booking.date).has(booking.slot)) {
    return c.html(renderBooking(c, values, { slot: slotTaken }), 409)
  }

  const id = createAppointment(c.var.db, booking)
  if (id === 'taken') return c.html(renderBooking(c, values, { slot: slotTaken }), 409)

  return c.redirect(`/appointments/${id}?booked=1`, 303)
})

appointmentsRoutes.get('/:id', (c) => {
  const appointment = findAppointment(c)
  if (!appointment) return c.notFound()

  const notice: Notice | undefined =
    c.req.query('booked') === '1'
      ? 'booked'
      : c.req.query('cancelled') === '1'
        ? 'cancelled'
        : undefined
  return c.html(renderAppointment(c, appointment, notice))
})

const alreadyCancelled = 'This appointment was already cancelled.'
const alreadyStarted = 'This appointment has already started, so it can’t be cancelled.'

appointmentsRoutes.post('/:id/cancel', (c) => {
  const appointment = findAppointment(c)
  if (!appointment) return c.notFound()

  let error: string | undefined
  if (appointment.status === 'cancelled') {
    error = alreadyCancelled
  } else if (hasStarted(appointment.date, appointment.slot, c.var.now())) {
    error = alreadyStarted
  } else if (!cancelAppointment(c.var.db, appointment.id)) {
    // Someone else cancelled it since we loaded it.
    error = alreadyCancelled
  }
  if (error) {
    const current = getAppointment(c.var.db, appointment.id) ?? appointment
    return c.html(renderAppointment(c, current, undefined, error), 409)
  }

  return c.redirect(`/appointments/${appointment.id}?cancelled=1`, 303)
})
