-- init.sql
-- Database schema initialization for Capi Money platform

-- Users table
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY, -- Use app-generated unique IDs
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    company_name VARCHAR(255),
    country VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- KYC status table
CREATE TABLE kyc_status (
    user_id VARCHAR(255) PRIMARY KEY REFERENCES users(id),
    status VARCHAR(50) NOT NULL,
    level VARCHAR(50) NOT NULL,
    last_verified TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Account balances table
CREATE TABLE account_balances (
    id VARCHAR(255) PRIMARY KEY, -- Use app-generated unique IDs
    user_id VARCHAR(255) REFERENCES users(id),
    currency VARCHAR(10) NOT NULL,
    amount DECIMAL(20,8) NOT NULL DEFAULT 0,
    reserved DECIMAL(20,8) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, currency)
);

-- Orders table
CREATE TABLE orders (
    id VARCHAR(255) PRIMARY KEY, -- Use app-generated unique IDs
    user_id VARCHAR(255) REFERENCES users(id),
    type VARCHAR(20) NOT NULL,
    side VARCHAR(10) NOT NULL CHECK (side IN ('buy', 'sell')),
    base_currency VARCHAR(10) NOT NULL,
    quote_currency VARCHAR(10) NOT NULL,
    amount DECIMAL(20,8) NOT NULL,
    price DECIMAL(20,8) NOT NULL,
    filled_amount DECIMAL(20,8) DEFAULT 0,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trades table
CREATE TABLE trades (
    id VARCHAR(255) PRIMARY KEY, -- Use app-generated unique IDs
    buy_order_id VARCHAR(255) REFERENCES orders(id),
    sell_order_id VARCHAR(255) REFERENCES orders(id),
    buyer_id VARCHAR(255) REFERENCES users(id),
    seller_id VARCHAR(255) REFERENCES users(id),
    base_currency VARCHAR(10) NOT NULL,
    quote_currency VARCHAR(10) NOT NULL,
    amount DECIMAL(20,8) NOT NULL,
    price DECIMAL(20,8) NOT NULL,
    fee DECIMAL(20,8) NOT NULL,
    status VARCHAR(20) NOT NULL,
    settlement_status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Risk assessments table
CREATE TABLE risk_assessments (
    id VARCHAR(255) PRIMARY KEY, -- Use app-generated unique IDs
    trade_id VARCHAR(255) REFERENCES trades(id),
    risk_level VARCHAR(20) NOT NULL,
    checks JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE notifications (
    id VARCHAR(255) PRIMARY KEY, -- Use app-generated unique IDs
    user_id VARCHAR(255) REFERENCES users(id),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User notification preferences
CREATE TABLE user_notification_preferences (
    user_id VARCHAR(255) PRIMARY KEY REFERENCES users(id),
    preferences JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit log
CREATE TABLE audit_log (
    id VARCHAR(255) PRIMARY KEY, -- Use app-generated unique IDs
    user_id VARCHAR(255) REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(255) NOT NULL,
    changes JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_trades_buyer ON trades(buyer_id);
CREATE INDEX idx_trades_seller ON trades(seller_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);

-- Add updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Add updated_at triggers to relevant tables
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trades_updated_at
    BEFORE UPDATE ON trades
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
