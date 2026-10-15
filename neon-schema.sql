CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
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

CREATE INDEX IF NOT EXISTS idx_students_matric_number ON students (matric_number);
CREATE INDEX IF NOT EXISTS idx_students_email ON students (email);
