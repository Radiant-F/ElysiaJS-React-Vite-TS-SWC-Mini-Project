-- Simple Postgres bootstrap for local dev (run as superuser, e.g., postgres)
-- Adjust the placeholders before running via psql.

-- Create role (skip if already exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'elysia_user') THEN
    CREATE ROLE elysia_user LOGIN PASSWORD 'change-me-strong-password';
  END IF;
END$$;

-- Create database if missing (cannot run CREATE DATABASE in a DO block; use psql \gexec)
SELECT 'CREATE DATABASE elysia_todo OWNER elysia_user'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'elysia_todo')
\gexec

-- Grant privileges if DB exists
SELECT 'GRANT ALL PRIVILEGES ON DATABASE elysia_todo TO elysia_user'
WHERE EXISTS (SELECT FROM pg_database WHERE datname = 'elysia_todo')
\gexec
