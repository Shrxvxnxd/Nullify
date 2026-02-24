const db = require('../config/db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    try {
        const sqlPath = path.join(__dirname, 'plastic_sales_migration.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Running plastic sales migration...');

        const statements = sql.split(';').filter(s => s.trim() !== '');

        for (let statement of statements) {
            await db.query(statement);
        }

        console.log('Plastic sales migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
