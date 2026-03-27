-- Candidates table
CREATE TABLE IF NOT EXISTS candidates (
  id SERIAL PRIMARY KEY,
  "fullName" VARCHAR(255) NOT NULL,
  email VARCHAR(320) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  "professionalProfile" VARCHAR(50) NOT NULL,
  "hasCNPJ" VARCHAR(10) NOT NULL DEFAULT 'no',
  cnpj VARCHAR(18),
  "companyName" VARCHAR(255),
  "registrationNumber" VARCHAR(50) NOT NULL,
  "registrationState" VARCHAR(2) NOT NULL,
  "yearsOfExperience" INTEGER NOT NULL,
  specialties TEXT,
  certifications TEXT,
  "additionalInfo" TEXT,
  "availableDays" TEXT,
  "availableShifts" TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'not_qualified',
  "qualificationLevel" INTEGER NOT NULL DEFAULT 3,
  "pendingReasons" TEXT,
  "s3FolderPath" VARCHAR(500),
  "s3FileName" VARCHAR(255),
  "submittedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "notificationSentAt" TIMESTAMPTZ
);

-- Submission logs table
CREATE TABLE IF NOT EXISTS submission_logs (
  id SERIAL PRIMARY KEY,
  "candidateId" INTEGER NOT NULL REFERENCES candidates(id),
  action VARCHAR(50) NOT NULL,
  details TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_candidates_profile_status
  ON candidates ("professionalProfile", status);

CREATE INDEX IF NOT EXISTS idx_candidates_qualification
  ON candidates ("qualificationLevel");

-- Enable Row Level Security (RLS)
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_logs ENABLE ROW LEVEL SECURITY;

-- Allow service role (backend) full access
CREATE POLICY "Service role full access on candidates"
  ON candidates FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on submission_logs"
  ON submission_logs FOR ALL
  USING (auth.role() = 'service_role');

-- Allow public form submissions (anon/authenticated)
CREATE POLICY "Anyone can submit candidates"
  ON candidates FOR INSERT
  WITH CHECK (true);

-- Allow reading candidate by id (for post-submission confirmation)
CREATE POLICY "Anyone can read candidate by id"
  ON candidates FOR SELECT
  USING (true);
