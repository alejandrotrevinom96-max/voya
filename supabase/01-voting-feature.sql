-- ============================================
-- FEATURE: Votación grupal de invitados
-- ============================================

-- 1. Extender trips con datos de invitación
ALTER TABLE trips
  ADD COLUMN IF NOT EXISTS voting_enabled BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS voting_token TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS voting_opened_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_trips_voting_token ON trips(voting_token) WHERE voting_token IS NOT NULL;

-- 2. Tabla de votos (sin auth requerida)
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  -- Identificación del invitado: o session_id (cookie) o user_id si se registró después
  voter_session_id TEXT NOT NULL,
  voter_name TEXT NOT NULL,
  voter_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  vote TEXT NOT NULL CHECK (vote IN ('up', 'down', 'meh')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Un voto por (actividad, sesión)
  UNIQUE(activity_id, voter_session_id)
);

CREATE INDEX IF NOT EXISTS idx_votes_trip_id ON votes(trip_id);
CREATE INDEX IF NOT EXISTS idx_votes_activity_id ON votes(activity_id);
CREATE INDEX IF NOT EXISTS idx_votes_session ON votes(voter_session_id);

-- 3. Tabla de invitados (para tracking + asociar después de registrar)
CREATE TABLE IF NOT EXISTS trip_invitees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  voter_session_id TEXT NOT NULL,
  voter_name TEXT NOT NULL,
  voter_email TEXT,
  voter_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  first_visited_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  vote_count INT DEFAULT 0,
  UNIQUE(trip_id, voter_session_id)
);

CREATE INDEX IF NOT EXISTS idx_invitees_trip_id ON trip_invitees(trip_id);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Habilitar RLS
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_invitees ENABLE ROW LEVEL SECURITY;

-- VOTES: cualquiera puede insertar votos en un trip con voting_enabled=true
DROP POLICY IF EXISTS "Anyone can vote on enabled trips" ON votes;
CREATE POLICY "Anyone can vote on enabled trips"
  ON votes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = votes.trip_id
      AND trips.voting_enabled = TRUE
    )
  );

-- VOTES: cualquiera puede actualizar SU voto (mismo session_id)
DROP POLICY IF EXISTS "Voters can update own votes" ON votes;
CREATE POLICY "Voters can update own votes"
  ON votes FOR UPDATE
  USING (TRUE);

-- VOTES: cualquiera puede leer votos en trips habilitados (para ver resumen agregado)
DROP POLICY IF EXISTS "Anyone can read votes on enabled trips" ON votes;
CREATE POLICY "Anyone can read votes on enabled trips"
  ON votes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = votes.trip_id
      AND trips.voting_enabled = TRUE
    )
  );

-- VOTES: el dueño del trip puede borrar votos (moderación)
DROP POLICY IF EXISTS "Trip owner can delete votes" ON votes;
CREATE POLICY "Trip owner can delete votes"
  ON votes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = votes.trip_id
      AND trips.user_id = auth.uid()
    )
  );

-- TRIP_INVITEES: cualquiera puede crear su entrada en trips habilitados
DROP POLICY IF EXISTS "Anyone can register as invitee" ON trip_invitees;
CREATE POLICY "Anyone can register as invitee"
  ON trip_invitees FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_invitees.trip_id
      AND trips.voting_enabled = TRUE
    )
  );

-- TRIP_INVITEES: cualquiera puede actualizar su propia entrada
DROP POLICY IF EXISTS "Invitees can update own entry" ON trip_invitees;
CREATE POLICY "Invitees can update own entry"
  ON trip_invitees FOR UPDATE
  USING (TRUE);

-- TRIP_INVITEES: el dueño del trip ve a todos los invitados
DROP POLICY IF EXISTS "Trip owner reads invitees" ON trip_invitees;
CREATE POLICY "Trip owner reads invitees"
  ON trip_invitees FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_invitees.trip_id
      AND trips.user_id = auth.uid()
    )
  );

-- TRIP_INVITEES: invitados pueden leer su propia entrada
DROP POLICY IF EXISTS "Invitees read own entry" ON trip_invitees;
CREATE POLICY "Invitees read own entry"
  ON trip_invitees FOR SELECT
  USING (TRUE);

-- ============================================
-- ACCESO PÚBLICO LIMITADO A TRIPS Y ACTIVITIES
-- (cuando voting_enabled = TRUE, el invitado debe poder leerlos sin auth)
-- ============================================

-- Política para leer trip público con voting_token
DROP POLICY IF EXISTS "Public read voting trips" ON trips;
CREATE POLICY "Public read voting trips"
  ON trips FOR SELECT
  USING (voting_enabled = TRUE);

-- Política para leer activities de trips con voting habilitado
DROP POLICY IF EXISTS "Public read activities of voting trips" ON activities;
CREATE POLICY "Public read activities of voting trips"
  ON activities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = activities.trip_id
      AND trips.voting_enabled = TRUE
    )
  );
