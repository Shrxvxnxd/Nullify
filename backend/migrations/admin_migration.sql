-- Admin Migration Script

-- 1. Add is_admin column to nullify_users
ALTER TABLE nullify_users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

-- 2. Create nullify_badges table
CREATE TABLE IF NOT EXISTS nullify_badges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create nullify_user_badges table
CREATE TABLE IF NOT EXISTS nullify_user_badges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    badge_id INT NOT NULL,
    awarded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES nullify_users(id) ON DELETE CASCADE,
    FOREIGN KEY (badge_id) REFERENCES nullify_badges(id) ON DELETE CASCADE
);

-- 4. Create nullify_critical_alerts table
CREATE TABLE IF NOT EXISTS nullify_critical_alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'warning',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    starts_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME DEFAULT NULL
);
