const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        multipleStatements: true // Crucial for running multiple SQL commands
    });

    console.log('Connected to MySQL');

    try {
        const sqlPath = path.join(__dirname, 'admin_migration.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Running migration...');
        await conn.query(sql);
        console.log('✅  Admin tables created and nullify_users updated.');

    } catch (err) {
        if (err.code === 'ER_DUP_COLUMN_NAME') {
            console.log('⚠️  is_admin column already exists, skipping ADD COLUMN.');
            // Run the rest without the ALTER TABLE line if it fails specifically on that
            const sqlPath = path.join(__dirname, 'admin_migration.sql');
            let sql = fs.readFileSync(sqlPath, 'utf8');
            sql = sql.replace(/ALTER TABLE nullify_users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;/g, '');
            await conn.query(sql);
            console.log('✅  Other admin tables created (if they didn\'t exist)');
        } else {
            console.error('❌  Migration error:', err.message);
        }
    } finally {
        await conn.end();
    }
}

runMigration();
