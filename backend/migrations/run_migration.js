const mysql = require('mysql2');
require('dotenv').config();

const conn = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

conn.connect(err => {
    if (err) {
        console.error('Connection error:', err.message);
        process.exit(1);
    }
    console.log('Connected to MySQL');

    const sql = `
        CREATE TABLE IF NOT EXISTS nullify_users (
            id                 INT AUTO_INCREMENT PRIMARY KEY,
            name               VARCHAR(100)  NOT NULL,
            phone              VARCHAR(15)   NOT NULL UNIQUE,
            password           VARCHAR(255)  NOT NULL,
            referred_by        VARCHAR(100)  DEFAULT NULL,
            community_location VARCHAR(100)  DEFAULT NULL,
            housing_type       VARCHAR(50)   DEFAULT NULL,
            created_at         DATETIME      DEFAULT CURRENT_TIMESTAMP
        )
    `;

    conn.query(sql, (err) => {
        if (err) {
            console.error('Error creating table:', err.message);
            process.exit(1);
        }
        console.log('✅  nullify_users table created (or already exists)');
        conn.end();
    });
});
