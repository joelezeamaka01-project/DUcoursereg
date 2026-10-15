-- Supabase SQL schema for Dominion University student accounts
-- 1) Create the students table
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  matric_number TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  program TEXT,
  level TEXT,
  semester TEXT,
  academic_year TEXT,
  reset_code TEXT,
  reset_code_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2) Optional: create an index for faster login by matric number
CREATE INDEX IF NOT EXISTS students_matric_number_idx
  ON public.students (matric_number);

-- 3) Optional: create an index for faster forgot-password lookup by email
CREATE INDEX IF NOT EXISTS students_email_idx
  ON public.students (email);

-- Example insert
-- INSERT INTO public.students (
--   full_name,
--   matric_number,
--   email,
--   password,
--   program,
--   level,
--   semester,
--   academic_year
-- ) VALUES (
--   'Sarah Mensah',
--   'DU/2024/0187',
--   'sarah.mensah@du.edu.ng',
--   'yourPassword123',
--   'BSc Computer Science',
--   '200 Level',
--   'First Semester',
--   '2026/2027'
-- );
