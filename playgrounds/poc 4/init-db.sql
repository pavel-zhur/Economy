-- Multi-database initialization script
-- Creates LangFuse, Backend, and Chainlit databases

-- Create databases
CREATE DATABASE langfuse;
CREATE DATABASE backend;
CREATE DATABASE chainlit;

-- Connect to backend database and set it up
\c backend

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create initial schema for the AI-managed database
-- The AI agent will be able to create and modify tables in this schema
CREATE SCHEMA IF NOT EXISTS ai_data;

-- Grant permissions to the application user
GRANT ALL PRIVILEGES ON SCHEMA ai_data TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA public TO postgres;

-- Create a sample table that AI can work with initially
CREATE TABLE IF NOT EXISTS ai_data.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_message TEXT NOT NULL,
    ai_response TEXT,
    sql_executed TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);

-- Create an audit log table to track all schema changes
CREATE TABLE IF NOT EXISTS ai_data.schema_changes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    change_type VARCHAR(50) NOT NULL, -- CREATE, ALTER, DROP, etc.
    table_name VARCHAR(255),
    sql_statement TEXT NOT NULL,
    executed_by VARCHAR(255) DEFAULT 'ai_agent',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    success BOOLEAN DEFAULT true,
    error_message TEXT
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON ai_data.conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_schema_changes_created_at ON ai_data.schema_changes(created_at);
CREATE INDEX IF NOT EXISTS idx_schema_changes_table_name ON ai_data.schema_changes(table_name);

-- Insert welcome message
INSERT INTO ai_data.conversations (user_message, ai_response, sql_executed) 
VALUES (
    'System initialization',
    'AI-managed database initialized successfully. I can help you create, modify, and query your data using natural language.',
    'Database and initial tables created'
) ON CONFLICT DO NOTHING;

COMMENT ON SCHEMA ai_data IS 'Schema managed by AI agent for dynamic data operations';
COMMENT ON TABLE ai_data.conversations IS 'Stores conversation history between user and AI agent';
COMMENT ON TABLE ai_data.schema_changes IS 'Audit log of all schema modifications performed by AI agent';

-- Connect to chainlit database and set it up for Chainlit chat persistence
\c chainlit

-- Enable required extensions for Chainlit
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant permissions to the application user for Chainlit database
GRANT ALL PRIVILEGES ON SCHEMA public TO postgres;

COMMENT ON DATABASE chainlit IS 'Database for Chainlit chat persistence and session management';

-- Switch back to default database
\c postgres 