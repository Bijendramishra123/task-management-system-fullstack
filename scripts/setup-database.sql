-- Task Management System Database Setup
-- PostgreSQL Migration Script for Neon Database

-- Create users table
CREATE TABLE IF NOT EXISTS "users" (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create tasks table with foreign key to users
CREATE TABLE IF NOT EXISTS "tasks" (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED')),
  user_id TEXT NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON "tasks"(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON "tasks"(status);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON "tasks"(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_email ON "users"(email);

-- Update timestamp function trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON "users";
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON "users"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tasks_updated_at ON "tasks";
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON "tasks"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
