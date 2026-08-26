const mongoose = require('mongoose');
const uri = 'mongodb://root:root@ac-xc33ipv-shard-00-00.6mzunvs.mongodb.net:27017,ac-xc33ipv-shard-00-01.6mzunvs.mongodb.net:27017,ac-xc33ipv-shard-00-02.6mzunvs.mongodb.net:27017/test?ssl=true&replicaSet=atlas-asahlb-shard-0&authSource=admin&retryWrites=true&w=majority';
mongoose.connect(uri)
  .then(async () => {
    const db = mongoose.connection.db;
    const studyPlans = await db.collection('studyplans').find({ studentId: 'st031' }).toArray();
    console.log('Plans for st031:', studyPlans);
    
    // Check if they have ANY plan at all
    const allSP = await db.collection('studyplans').find({ studentId: { $regex: new RegExp('st031', 'i') } }).toArray();
    console.log('All plans for st031 regex:', allSP.map(sp => sp.studentId));

    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
