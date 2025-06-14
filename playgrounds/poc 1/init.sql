-- Database initialization for Economy POC
-- This file sets up the basic database structure

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create initial schema for financial data
-- Note: This will be extended dynamically by the AI system

-- System metadata table for schema evolution
CREATE TABLE IF NOT EXISTS schema_versions (
    id SERIAL PRIMARY KEY,
    version VARCHAR(50) NOT NULL,
    description TEXT,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    applied_by VARCHAR(100) DEFAULT 'system'
);

-- Log all AI-driven schema changes
CREATE TABLE IF NOT EXISTS ai_schema_changes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    change_type VARCHAR(50) NOT NULL, -- 'create_table', 'alter_table', 'create_index', etc.
    table_name VARCHAR(100),
    column_name VARCHAR(100),
    sql_executed TEXT NOT NULL,
    reasoning TEXT, -- Why the AI made this change
    user_request TEXT, -- Original user request that triggered the change
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    success BOOLEAN DEFAULT true,
    error_message TEXT
);

-- Basic user context (minimal, will be extended by AI)
CREATE TABLE IF NOT EXISTS user_profile (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100),
    currency VARCHAR(3) DEFAULT 'USD',
    timezone VARCHAR(50) DEFAULT 'UTC',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial version
INSERT INTO schema_versions (version, description) 
VALUES ('1.0.0', 'Initial schema with AI-driven evolution capability')
ON CONFLICT DO NOTHING;

-- Insert default user profile
INSERT INTO user_profile (name, currency) 
VALUES ('Default User', 'USD')
ON CONFLICT DO NOTHING;