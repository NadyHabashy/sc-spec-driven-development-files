-- Appointments: one agent, one therapy, in one hourly slot on one date.

CREATE TABLE appointments (
  id INTEGER PRIMARY KEY,
  agent_id INTEGER NOT NULL REFERENCES agents (id) ON DELETE CASCADE,
  therapy_id INTEGER NOT NULL REFERENCES therapies (id) ON DELETE CASCADE,
  -- IS, not =, so an unparseable date (strftime gives NULL) fails the check.
  date TEXT NOT NULL CHECK (date IS strftime('%Y-%m-%d', date)),
  slot TEXT NOT NULL CHECK (
    slot IN ('09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00')
  ),
  status TEXT NOT NULL DEFAULT 'booked' CHECK (status IN ('booked', 'cancelled')),
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- The clinic has one room: a slot holds at most one booked appointment.
-- Cancelled appointments free their slot.
CREATE UNIQUE INDEX appointments_booked_slot ON appointments (date, slot)
  WHERE status = 'booked';

CREATE INDEX appointments_agent_date ON appointments (agent_id, date);
