-- Initialize AI Financial Planning Database
-- This script sets up the database with proper extensions and basic configuration

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create user and grant permissions (if not exists)
DO $$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'admin') THEN
      CREATE ROLE admin LOGIN PASSWORD 'admin123';
   END IF;
END
$$;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE financial_planning TO admin;

-- Create schema for LangFuse if it doesn't exist
CREATE SCHEMA IF NOT EXISTS langfuse;
GRANT ALL ON SCHEMA langfuse TO admin;

-- Set default schema search path
ALTER DATABASE financial_planning SET search_path TO public, langfuse;

-- Create initial statistics table for monitoring
CREATE TABLE IF NOT EXISTS public.system_stats (
    id SERIAL PRIMARY KEY,
    stat_name VARCHAR(100) NOT NULL,
    stat_value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial system stats
INSERT INTO public.system_stats (stat_name, stat_value) VALUES 
('database_initialized', 'true'),
('initialization_time', NOW()::TEXT)
ON CONFLICT DO NOTHING;

-- Create function to log system operations
CREATE OR REPLACE FUNCTION log_system_operation(
    operation_type TEXT,
    operation_description TEXT,
    user_message TEXT DEFAULT NULL,
    ai_interpretation TEXT DEFAULT NULL,
    sql_executed TEXT DEFAULT NULL,
    operation_result TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    -- This function will be used by the application to log AI operations
    -- The actual implementation will be handled by SQLAlchemy models
    NULL;
END;
$$ LANGUAGE plpgsql;