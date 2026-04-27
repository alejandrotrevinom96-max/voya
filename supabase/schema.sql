-- ============================================
-- Voya MVP · Schema completo
-- ============================================
-- Cópialo y pégalo en Supabase: SQL Editor → New query → Run
-- ============================================

-- ============================================
-- 1. TABLA: profiles
-- ============================================
-- Extiende auth.users de Supabase con info adicional del usuario
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Cada usuario puede ver/editar SOLO su propio perfil
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Trigger: cuando un user nuevo se registra en auth.users, crear su profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================
-- 2. TABLA: trips (viajes)
-- ============================================
CREATE TABLE IF NOT EXISTS public.trips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  destination TEXT NOT NULL,
  country TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  travelers INTEGER DEFAULT 1 NOT NULL,
  interests TEXT[] DEFAULT '{}' NOT NULL,
  currency TEXT DEFAULT 'MXN' NOT NULL,
  emoji TEXT DEFAULT '✈️',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT valid_dates CHECK (end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS trips_user_id_idx ON public.trips(user_id);
CREATE INDEX IF NOT EXISTS trips_start_date_idx ON public.trips(start_date DESC);

ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trips" ON public.trips
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trips" ON public.trips
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trips" ON public.trips
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trips" ON public.trips
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 3. TABLA: activities (catálogo de actividades sugeridas por AI)
-- ============================================
-- Almacena las actividades que la AI generó para un viaje específico
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'restaurant', 'museum', 'tour', 'nature', 'nightlife', 'shopping', 'beach', 'culture', 'other'
  description TEXT,
  estimated_price_min INTEGER, -- en la moneda del viaje
  estimated_price_max INTEGER,
  estimated_duration_minutes INTEGER, -- duración estimada
  location_name TEXT, -- ej: "Centro Histórico, Mérida"
  ai_confidence TEXT DEFAULT 'medium', -- 'high', 'medium', 'low'
  notes TEXT, -- tips de la AI: "ir temprano", "reservar antes", etc.
  is_added BOOLEAN DEFAULT FALSE NOT NULL, -- el usuario lo agregó a su itinerario?
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS activities_trip_id_idx ON public.activities(trip_id);
CREATE INDEX IF NOT EXISTS activities_is_added_idx ON public.activities(trip_id, is_added);

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Las activities se acceden a través del trip (mismo dueño)
CREATE POLICY "Users can view own activities" ON public.activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = activities.trip_id AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own activities" ON public.activities
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = activities.trip_id AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own activities" ON public.activities
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = activities.trip_id AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own activities" ON public.activities
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = activities.trip_id AND trips.user_id = auth.uid()
    )
  );

-- ============================================
-- 4. TABLA: schedule (actividades agendadas en días específicos)
-- ============================================
CREATE TABLE IF NOT EXISTS public.schedule (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE NOT NULL,
  day_date DATE NOT NULL,
  start_time TIME, -- opcional, hora del día
  order_index INTEGER DEFAULT 0 NOT NULL, -- orden dentro del día
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(trip_id, activity_id) -- una actividad solo puede agendarse una vez por viaje
);

CREATE INDEX IF NOT EXISTS schedule_trip_day_idx ON public.schedule(trip_id, day_date);

ALTER TABLE public.schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own schedule" ON public.schedule
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = schedule.trip_id AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own schedule" ON public.schedule
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = schedule.trip_id AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own schedule" ON public.schedule
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = schedule.trip_id AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own schedule" ON public.schedule
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = schedule.trip_id AND trips.user_id = auth.uid()
    )
  );

-- ============================================
-- Trigger: actualizar updated_at automáticamente
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();

DROP TRIGGER IF EXISTS update_trips_updated_at ON public.trips;
CREATE TRIGGER update_trips_updated_at
  BEFORE UPDATE ON public.trips
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();

-- ============================================
-- ¡Listo! Verificación:
-- ============================================
-- Ve a Database → Tables y deberías ver: profiles, trips, activities, schedule
-- Ve a Database → Authentication → Policies y deberías ver las RLS configuradas
