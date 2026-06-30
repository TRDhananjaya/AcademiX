const mongoose = require('mongoose');

const connectDb = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected (Atlas): ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Atlas Connection Error: ${error.message}`);
        console.log('Attempting local MongoDB fallback at mongodb://127.0.0.1:27017/academix...');
        try {
            const localConn = await mongoose.connect('mongodb://127.0.0.1:27017/academix', {
                serverSelectionTimeoutMS: 3000 // fail fast in 3s
            });
            console.log(`MongoDB Connected (Local): ${localConn.connection.host}`);
        } catch (localError) {
            console.error(`Local MongoDB Connection Error: ${localError.message}`);
            console.error('CRITICAL WARNING: Both Atlas and Local Databases are unreachable. The server will stay running, but DB queries will fail.');
            // Do NOT call process.exit(1) to ensure express server remains alive
        }
    }
};

module.exports = { connectDb };
