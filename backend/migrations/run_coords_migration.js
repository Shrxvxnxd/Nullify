const fs = require('fs');
const path = require('path');
const db = require('../config/db');

async function runMigration() {
    try {
        console.log('--- Starting Coordinates Migration ---');
        const sqlPath = path.join(__dirname, 'add_coords_to_reports.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        for (const statement of statements) {
            console.log('Executing:', statement.substring(0, 50) + '...');
            await db.execute(statement);
        }

        console.log('--- Coordinates Migration Successful ---');
        process.exit(0);
    } catch (err) {
        console.error('--- Coordinates Migration Failed ---');
        console.error(err);
        process.exit(1);
    }
}

runMigration();
