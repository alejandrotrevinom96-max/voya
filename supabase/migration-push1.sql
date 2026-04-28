-- ============================================
-- Voya · Push 1 · Schema migration
-- ============================================
-- Cópialo y pégalo en Supabase: SQL Editor → New query → Run
-- Este SQL es INCREMENTAL: solo agrega columnas nuevas, NO rompe datos existentes.
-- ============================================

-- 1. Agregar columna trip_type (tipo de viaje: romántico, familiar, etc.)
ALTER TABLE public.trips
  ADD COLUMN IF NOT EXISTS trip_type TEXT;

-- 2. Agregar columna cities (array de ciudades a visitar)
ALTER TABLE public.trips
  ADD COLUMN IF NOT EXISTS cities TEXT[] DEFAULT '{}' NOT NULL;

-- 3. Agregar columna share_token (token único para compartir el viaje)
ALTER TABLE public.trips
  ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE;

-- 4. Agregar columna is_share_enabled (el owner puede activar/desactivar el link)
ALTER TABLE public.trips
  ADD COLUMN IF NOT EXISTS is_share_enabled BOOLEAN DEFAULT FALSE NOT NULL;

-- 5. Índice para búsqueda rápida por share_token
CREATE INDEX IF NOT EXISTS trips_share_token_idx
  ON public.trips(share_token)
  WHERE share_token IS NOT NULL;

-- ============================================
-- POLICY: permitir lectura pública de viajes compartidos
-- ============================================
-- Cualquier persona (incluso sin login) puede ver un viaje
-- SI tiene un share_token válido Y is_share_enabled = true
DROP POLICY IF EXISTS "Public can view shared trips" ON public.trips;
CREATE POLICY "Public can view shared trips" ON public.trips
  FOR SELECT
  USING (share_token IS NOT NULL AND is_share_enabled = true);

-- También permitir lectura pública de actividades de viajes compartidos
DROP POLICY IF EXISTS "Public can view shared activities" ON public.activities;
CREATE POLICY "Public can view shared activities" ON public.activities
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = activities.trip_id
        AND trips.share_token IS NOT NULL
        AND trips.is_share_enabled = true
    )
  );

-- Y schedule de viajes compartidos
DROP POLICY IF EXISTS "Public can view shared schedule" ON public.schedule;
CREATE POLICY "Public can view shared schedule" ON public.schedule
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = schedule.trip_id
        AND trips.share_token IS NOT NULL
        AND trips.is_share_enabled = true
    )
  );

-- ============================================
-- Verificación
-- ============================================
-- Después de correr esto, ve a:
-- Database → Tables → trips
-- Deberías ver 4 columnas nuevas: trip_type, cities, share_token, is_share_enabled
