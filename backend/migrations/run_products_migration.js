const db = require('../config/db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    try {
        const sqlPath = path.join(__dirname, 'products_migration.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Running products migration...');

        // Split by semicolon to run multiple statements if any
        const statements = sql.split(';').filter(s => s.trim() !== '');

        for (let statement of statements) {
            await db.query(statement);
        }

        console.log('Products migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
