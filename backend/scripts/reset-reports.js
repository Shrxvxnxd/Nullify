const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

async function resetDb() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'nullify'
    });

    try {
        console.log('--- Database Reset Initiated ---');

        // Drop existing table
        process.stdout.write('Dropping reports table... ');
        await connection.execute('DROP TABLE IF EXISTS reports');
        console.log('DONE');

        // Create new table
        process.stdout.write('Recreating reports table... ');
        await connection.execute(`
            CREATE TABLE reports (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                image_path VARCHAR(255),
                latitude DOUBLE NOT NULL,
                longitude DOUBLE NOT NULL,
                status ENUM('pending', 'resolved') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_status (status)
            )
        `);
        console.log('DONE');

        console.log('--- Database Reset Successful ---');
    } catch (err) {
        console.error('--- Database Reset Failed ---');
        console.error(err);
    } finally {
        await connection.end();
    }
}

resetDb();
