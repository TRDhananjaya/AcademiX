const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGO_URI || 'mongodb://root:root@ac-xc33ipv-shard-00-00.6mzunvs.mongodb.net:27017,ac-xc33ipv-shard-00-01.6mzunvs.mongodb.net:27017,ac-xc33ipv-shard-00-02.6mzunvs.mongodb.net:27017/test?ssl=true&replicaSet=atlas-asahlb-shard-0&authSource=admin&retryWrites=true&w=majority';

const { recoverMissingStudyPlans } = require('../controllers/studyPlanController');

async function testRecovery() {
    await mongoose.connect(uri);
    console.log('Connected to DB');

    const req = {
        body: { studentId: 'st035' }
    };

    const res = {
        status: function(s) {
            this.statusCode = s;
            return this;
        },
        json: function(data) {
            console.log(`Status: ${this.statusCode}`);
            console.log(JSON.stringify(data, null, 2));
        }
    };

    await recoverMissingStudyPlans(req, res);
    
    // Give background async tasks a little time
    setTimeout(() => {
        process.exit(0);
    }, 2000);
}

testRecovery().catch(console.error);
