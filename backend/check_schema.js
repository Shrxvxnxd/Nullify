const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

async function checkSchema() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    const [rows] = await db.execute('DESCRIBE nullify_users');
    console.log(JSON.stringify(rows, null, 2));
    await db.end();
}

checkSchema().catch(console.error);
