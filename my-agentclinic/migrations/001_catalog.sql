-- Catalog: agents, ailments, therapies, and the links between them.

CREATE TABLE agents (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  model TEXT NOT NULL,
  bio TEXT NOT NULL
);

CREATE TABLE ailments (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('mild', 'moderate', 'severe'))
);

CREATE TABLE therapies (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0)
);

CREATE TABLE agent_ailments (
  agent_id INTEGER NOT NULL REFERENCES agents (id) ON DELETE CASCADE,
  ailment_id INTEGER NOT NULL REFERENCES ailments (id) ON DELETE CASCADE,
  PRIMARY KEY (agent_id, ailment_id)
);

CREATE TABLE ailment_therapies (
  ailment_id INTEGER NOT NULL REFERENCES ailments (id) ON DELETE CASCADE,
  therapy_id INTEGER NOT NULL REFERENCES therapies (id) ON DELETE CASCADE,
  PRIMARY KEY (ailment_id, therapy_id)
);

CREATE INDEX ailment_therapies_therapy ON ailment_therapies (therapy_id);
CREATE INDEX agent_ailments_ailment ON agent_ailments (ailment_id);
