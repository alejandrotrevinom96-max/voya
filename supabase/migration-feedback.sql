-- ============================================
-- Voya · Tabla feedback + Admin role
-- ============================================
-- Cópialo y pégalo en Supabase: SQL Editor → New query → Run
-- ============================================

-- ============================================
-- 1. Tabla feedback
-- ============================================
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  trip_id UUID REFERENCES public.trips(id) ON DELETE SET NULL,

  -- NPS: ¿Qué tan probable es que recomiendes Voya? (1-10)
  nps_score INTEGER CHECK (nps_score >= 1 AND nps_score <= 10),

  -- Pregunta abierta: ¿qué fue lo más útil?
  most_useful TEXT,

  -- Pregunta abierta: ¿qué te faltó o mejorarías?
  what_was_missing TEXT,

  -- Willingness to pay: opción de tradeoff
  -- Valores: 'yes-no-question', 'would-consider', 'specific-need',
  --         'prefer-free', 'unsure'
  willingness_to_pay TEXT,

  -- Si eligió 'specific-need', qué le haría pagar
  specific_pay_reason TEXT,

  -- Metadata
  source TEXT DEFAULT 'first-trip-modal' NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS feedback_user_id_idx ON public.feedback(user_id);
CREATE INDEX IF NOT EXISTS feedback_created_at_idx ON public.feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS feedback_nps_idx ON public.feedback(nps_score);

-- ============================================
-- 2. RLS: Row Level Security
-- ============================================
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Cualquier user logueado puede crear su propio feedback
DROP POLICY IF EXISTS "Users can submit own feedback" ON public.feedback;
CREATE POLICY "Users can submit own feedback" ON public.feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Cada user puede ver solo su propio feedback
DROP POLICY IF EXISTS "Users can view own feedback" ON public.feedback;
CREATE POLICY "Users can view own feedback" ON public.feedback
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- 3. Admin: agregar columna is_admin a profiles
-- ============================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE NOT NULL;

-- ============================================
-- 4. Marcar a Alejandro como admin
-- ============================================
-- IMPORTANTE: este UPDATE solo funciona si ya existe el user con ese email.
-- Si Alejandro aún no se ha registrado, hay que correr este UPDATE
-- DESPUÉS de que se registre.
UPDATE public.profiles
SET is_admin = TRUE
WHERE email = 'alejandro.trevinom96@gmail.com';

-- ============================================
-- 5. Policy admin: ver TODO el feedback
-- ============================================
-- Los admins pueden leer todas las respuestas
DROP POLICY IF EXISTS "Admins can view all feedback" ON public.feedback;
CREATE POLICY "Admins can view all feedback" ON public.feedback
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    )
  );

-- ============================================
-- 6. Tabla auxiliar: feedback dismissals
-- ============================================
-- Para recordar si un usuario ya dijo "Ahora no" y no mostrarles el modal otra vez
CREATE TABLE IF NOT EXISTS public.feedback_dismissals (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  source TEXT NOT NULL,
  dismissed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.feedback_dismissals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own dismissals" ON public.feedback_dismissals;
CREATE POLICY "Users manage own dismissals" ON public.feedback_dismissals
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- ¡Listo! Verifica:
-- ============================================
-- 1. Database → Tables → debes ver 'feedback' y 'feedback_dismissals'
-- 2. Database → Tables → 'profiles' debe tener nueva columna 'is_admin'
-- 3. Tu user (alejandro.trevinom96@gmail.com) debe tener is_admin = true
--    Verifica corriendo:
--    SELECT email, is_admin FROM public.profiles WHERE email = 'alejandro.trevinom96@gmail.com';
