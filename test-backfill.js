const mongoose = require('mongoose');
const { backfillPredictions } = require('./backend/controllers/predictionController');
require('dotenv').config({ path: './backend/.env' });

async function run() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/academix');
    
    const req = {};
    const res = {
        status: function(code) {
            this.statusCode = code;
            return this;
        },
        json: function(data) {
            console.log("STATUS:", this.statusCode);
            console.log("RESPONSE:", JSON.stringify(data, null, 2));
        }
    };
    
    await backfillPredictions(req, res, (err) => console.error(err));
    process.exit(0);
}

run();
