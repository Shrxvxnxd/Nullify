const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });
// Or if running from current dir:
if (!process.env.DB_HOST) dotenv.config();

async function testConnection() {
    const config = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    };

    console.log('Testing connection to:', config.host);
    console.log('User:', config.user);
    console.log('Database:', config.database);

    try {
        const connection = await mysql.createConnection(config);
        console.log('✅ Connection successful!');

        const [tables] = await connection.execute('SHOW TABLES');
        console.log('Tables found:', tables.map(t => Object.values(t)[0]));

        const [users] = await connection.execute('SELECT COUNT(*) as count FROM nullify_users');
        console.log('Users count:', users[0].count);

        await connection.end();
    } catch (err) {
        console.error('❌ Connection failed:', err.message);
    }
}

testConnection();
