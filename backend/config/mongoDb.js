const mongoose = require('mongoose');

const connectMongo = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            console.error('MONGODB_URI not found in environment variables');
            return;
        }
        await mongoose.connect(uri);
        console.log('--- MongoDB Connected Successfully ---');
    } catch (err) {
        console.error('--- MongoDB Connection Failed ---');
        console.error(err);
    }
};

module.exports = connectMongo;
