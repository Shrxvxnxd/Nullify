-- Plastic Sales Migration Script
CREATE TABLE IF NOT EXISTS plastic_sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    object_type VARCHAR(100) NOT NULL,
    confidence FLOAT NOT NULL,
    weight DECIMAL(10, 2) NOT NULL,
    rate_per_kg DECIMAL(10, 2) NOT NULL,
    estimated_price DECIMAL(10, 2) NOT NULL,
    image_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES nullify_users(id) ON DELETE CASCADE
);
