/*
  # Create Resume Analyses System

  ## Overview
  This migration sets up the database schema for storing resume analyses for authenticated users.
  Users can upload resumes, get AI analysis, and save/retrieve their analysis history.

  ## New Tables
  
  ### `resume_analyses`
  Stores all resume analysis records with full analysis data
  - `id` (uuid, primary key) - Unique identifier for each analysis
  - `user_id` (uuid, foreign key) - References auth.users(id)
  - `filename` (text) - Original resume filename
  - `resume_text` (text) - Extracted text from resume
  - `job_description` (text, nullable) - Optional job description used for matching
  - `match_score` (integer) - Overall match score (0-100)
  - `breakdown` (jsonb) - Detailed breakdown of scores
  - `extracted_skills` (text[]) - Array of skills found in resume
  - `missing_skills` (text[]) - Skills from JD not found in resume
  - `suggestions` (text[]) - AI-generated suggestions for improvement
  - `created_at` (timestamptz) - When the analysis was created
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  
  ### Row Level Security (RLS)
  - Enable RLS on `resume_analyses` table
  - Users can only view their own analyses
  - Users can only insert their own analyses
  - Users can only update their own analyses
  - Users can only delete their own analyses

  ## Indexes
  - Index on user_id for fast user-specific queries
  - Index on created_at for sorting by date
*/

-- Create resume_analyses table
CREATE TABLE IF NOT EXISTS resume_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename text NOT NULL,
  resume_text text NOT NULL DEFAULT '',
  job_description text,
  match_score integer NOT NULL DEFAULT 0,
  breakdown jsonb NOT NULL DEFAULT '{}'::jsonb,
  extracted_skills text[] NOT NULL DEFAULT ARRAY[]::text[],
  missing_skills text[] NOT NULL DEFAULT ARRAY[]::text[],
  suggestions text[] NOT NULL DEFAULT ARRAY[]::text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_resume_analyses_user_id ON resume_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_analyses_created_at ON resume_analyses(created_at DESC);

-- Enable Row Level Security
ALTER TABLE resume_analyses ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own analyses
CREATE POLICY "Users can view own resume analyses"
  ON resume_analyses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own analyses
CREATE POLICY "Users can insert own resume analyses"
  ON resume_analyses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own analyses
CREATE POLICY "Users can update own resume analyses"
  ON resume_analyses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete their own analyses
CREATE POLICY "Users can delete own resume analyses"
  ON resume_analyses
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_resume_analyses_updated_at
  BEFORE UPDATE ON resume_analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();