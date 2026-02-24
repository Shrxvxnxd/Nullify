const mysql = require('mysql2');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('Attempting to connect with the following parameters:');
console.log('Host:', process.env.DB_HOST);
console.log('User:', process.env.DB_USER);
console.log('Database:', process.env.DB_NAME);
// Do not log the password

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

connection.connect((err) => {
    if (err) {
        const errorMsg = `Error connecting to MySQL: ${err.message}\n` +
            (err.code ? `Code: ${err.code}\n` : '') +
            (err.errno ? `Errno: ${err.errno}\n` : '') +
            (err.sqlState ? `SQLState: ${err.sqlState}\n` : '');

        console.error(errorMsg);

        const fs = require('fs');
        fs.writeFileSync(path.join(__dirname, 'db_error.txt'), errorMsg);

        if (err.code === 'ECONNREFUSED' && process.env.DB_HOST === 'localhost') {
            console.error('\nHint: If you are trying to connect to a remote Hostinger database from your local machine, checking "localhost" will likely fail unless you have an SSH tunnel. You likely need the actual IP address or hostname of the Hostinger database.');
        }
        process.exit(1);
    }
    console.log('Successfully connected to MySQL database!');

    connection.query('SHOW TABLES', (err, results) => {
        if (err) {
            console.error('Error executing query:', err.message);
            process.exit(1);
        }
        console.log('Available tables:', results.map(row => Object.values(row)[0]));
        connection.end();
    });
});
