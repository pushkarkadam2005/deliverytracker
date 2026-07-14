-- ==========================================
-- Database Tables
-- ==========================================

-- Create 'users' table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_users_role CHECK (role IN ('ADMIN', 'CUSTOMER', 'AGENT'))
);

-- Create 'customer_profiles' table (extends users with role CUSTOMER)
CREATE TABLE IF NOT EXISTS customer_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    phone VARCHAR(15),
    default_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_customer_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_customer_profile_user UNIQUE (user_id)
);

-- Create 'delivery_agents' table (extends users with role AGENT)
CREATE TABLE IF NOT EXISTS delivery_agents (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    phone VARCHAR(15),
    vehicle_number VARCHAR(20),
    availability_status VARCHAR(50) DEFAULT 'AVAILABLE',
    current_latitude DOUBLE PRECISION,
    current_longitude DOUBLE PRECISION,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_delivery_agent_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_delivery_agent_user UNIQUE (user_id),
    CONSTRAINT chk_latitude CHECK (current_latitude BETWEEN -90.0 AND 90.0),
    CONSTRAINT chk_longitude CHECK (current_longitude BETWEEN -180.0 AND 180.0),
    CONSTRAINT chk_agents_status CHECK (availability_status IN ('AVAILABLE', 'BUSY', 'OFFLINE'))
);

-- ==========================================
-- 3. Database Indexes
-- ==========================================

-- Unique index on email to optimize authentication query checks
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Unique index on customer_profiles user_id to optimize user-to-profile joins
CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_profiles_user_id ON customer_profiles(user_id);

-- Unique index on delivery_agents user_id to optimize agent-to-user lookup performance
CREATE UNIQUE INDEX IF NOT EXISTS idx_delivery_agents_user_id ON delivery_agents(user_id);

-- Index on availability_status to speed up agent allocation and assignment engine queries
CREATE INDEX IF NOT EXISTS idx_delivery_agents_status ON delivery_agents(availability_status);
