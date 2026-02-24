const fs = require('fs');
const path = require('path');
const db = require('../config/db');

async function runMigration() {
    try {
        console.log('--- Starting Reports Migration ---');
        const sqlPath = path.join(__dirname, 'reports_migration.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Split by semicolon but ignore ones inside strings or comments if any (simple split here)
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        for (const statement of statements) {
            console.log('Executing:', statement.substring(0, 50) + '...');
            await db.execute(statement);
        }

        console.log('--- Reports Migration Successful ---');
        process.exit(0);
    } catch (err) {
        console.error('--- Reports Migration Failed ---');
        console.error(err);
        process.exit(1);
    }
}

runMigration();
