const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

async function resetPoints() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    console.log('--- Resetting Points (Rejecting all verified reports) ---');
    const [result] = await db.execute("UPDATE nullify_reports SET status = 'rejected' WHERE status = 'verified'");
    console.log(`Updated ${result.affectedRows} reports.`);

    await db.end();
}

resetPoints().catch(console.error);
