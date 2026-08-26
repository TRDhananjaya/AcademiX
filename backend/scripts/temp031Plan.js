const mongoose = require('mongoose');
const uri = 'mongodb://root:root@ac-xc33ipv-shard-00-00.6mzunvs.mongodb.net:27017,ac-xc33ipv-shard-00-01.6mzunvs.mongodb.net:27017,ac-xc33ipv-shard-00-02.6mzunvs.mongodb.net:27017/test?ssl=true&replicaSet=atlas-asahlb-shard-0&authSource=admin&retryWrites=true&w=majority';
mongoose.connect(uri).then(async () => {
    const plans = await mongoose.connection.db.collection('study_plans').find({ studentId: { $in: ['st031', 'ST031'] } }).toArray();
    console.log('st031 study plans count:', plans.length);
    plans.forEach(p => console.log(p.createdAt));
    process.exit(0);
});
