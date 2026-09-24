-- AI-Powered Helpdesk Ticket Prioritization and Routing System
-- PostgreSQL Database Schema

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    department VARCHAR(120),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS support_teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    slug VARCHAR(80) UNIQUE NOT NULL,
    description TEXT,
    lead_agent VARCHAR(120) DEFAULT 'Support Lead',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    created_by VARCHAR(150) NOT NULL,
    category VARCHAR(80),
    predicted_category VARCHAR(80),
    category_confidence FLOAT DEFAULT 0.0,
    priority VARCHAR(40) DEFAULT 'Medium',
    priority_confidence FLOAT DEFAULT 0.0,
    status VARCHAR(40) DEFAULT 'Open',
    assigned_team_id INTEGER REFERENCES support_teams(id) ON DELETE SET NULL,
    assigned_agent_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    sla_deadline TIMESTAMP,
    ai_analysis TEXT,
    routing_reason TEXT,
    resolution_suggestions TEXT,
    department VARCHAR(120),
    device VARCHAR(120),
    location VARCHAR(120),
    additional_info TEXT,
    email VARCHAR(150),
    affected_users INTEGER DEFAULT 1,
    business_impact VARCHAR(80) DEFAULT 'Low',
    downtime VARCHAR(80) DEFAULT 'None'
);

CREATE TABLE IF NOT EXISTS ticket_predictions (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    category VARCHAR(80) NOT NULL,
    category_confidence FLOAT DEFAULT 0.0,
    priority VARCHAR(40) NOT NULL,
    priority_confidence FLOAT DEFAULT 0.0,
    model_name VARCHAR(120) DEFAULT 'DistilBERT / XGBoost',
    model_version VARCHAR(60) DEFAULT 'demo-v1.0',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ticket_history (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    action VARCHAR(120) NOT NULL,
    old_value VARCHAR(255),
    new_value VARCHAR(255),
    performed_by VARCHAR(150),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS knowledge_articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(80) NOT NULL,
    keywords TEXT,
    problem TEXT,
    solution TEXT,
    related_tickets TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS routing_rules (
    id SERIAL PRIMARY KEY,
    category VARCHAR(80) NOT NULL,
    priority VARCHAR(40) NOT NULL,
    team VARCHAR(120) NOT NULL,
    agent_name VARCHAR(120),
    condition VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    author_name VARCHAR(120) DEFAULT 'Support Specialist',
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attachments (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500),
    file_size INTEGER DEFAULT 0,
    content_type VARCHAR(100) DEFAULT 'application/octet-stream',
    uploaded_by VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    ticket_id INTEGER,
    message TEXT NOT NULL,
    type VARCHAR(80) DEFAULT 'info',
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sla_policies (
    id SERIAL PRIMARY KEY,
    priority VARCHAR(40) NOT NULL,
    response_time_hours FLOAT DEFAULT 4.0,
    resolution_time_hours FLOAT DEFAULT 24.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
