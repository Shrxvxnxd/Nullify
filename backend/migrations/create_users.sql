-- Run this in your MySQL database to create the users table
CREATE TABLE IF NOT EXISTS users (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100)  NOT NULL,
    phone           VARCHAR(15)   NOT NULL UNIQUE,
    password        VARCHAR(255)  NOT NULL,
    referred_by     VARCHAR(100)  DEFAULT NULL,
    community_location VARCHAR(100) DEFAULT NULL,
    housing_type    VARCHAR(50)   DEFAULT NULL,
    created_at      DATETIME      DEFAULT CURRENT_TIMESTAMP
);
