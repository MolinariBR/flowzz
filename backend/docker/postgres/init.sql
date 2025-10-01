-- PostgreSQL initialization script for Flowzz API
-- Referência: design.md §Database Setup

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create database if not exists (handled by Docker)
-- CREATE DATABASE flowzz_db;

-- Grant permissions to user
GRANT ALL PRIVILEGES ON DATABASE flowzz_db TO flowzz_user;

-- Set timezone
SET timezone = 'UTC';

-- Create custom types (will be managed by Prisma migrations later)
-- These are just examples, actual types will be created by Prisma

-- Log successful initialization
INSERT INTO pg_stat_activity (query) 
VALUES ('-- Flowzz database initialized successfully at ' || now());

-- Show initialization completion
SELECT 'Flowzz PostgreSQL database initialized successfully!' as status;