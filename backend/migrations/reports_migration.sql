-- Create Reports Table
CREATE TABLE IF NOT EXISTS nullify_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    severity ENUM('Low', 'Med', 'High') DEFAULT 'Med',
    description TEXT,
    image_url TEXT,
    status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES nullify_users(id) ON DELETE CASCADE
);

-- Insert some dummy reports for initial stats if table is empty
INSERT INTO nullify_reports (user_id, type, location, severity, description, status)
SELECT id, 'Waste Hotspot', 'Koramangala', 'High', 'Large pile of plastic waste near park entrance.', 'verified'
FROM nullify_users LIMIT 1;

INSERT INTO nullify_reports (user_id, type, location, severity, description, status)
SELECT id, 'Illegal Dumping', 'Indiranagar', 'Med', 'Construction debris left on sidewalk.', 'verified'
FROM nullify_users LIMIT 1;
