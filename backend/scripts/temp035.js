const mongoose = require('mongoose');
const uri = 'mongodb://root:root@ac-xc33ipv-shard-00-00.6mzunvs.mongodb.net:27017,ac-xc33ipv-shard-00-01.6mzunvs.mongodb.net:27017,ac-xc33ipv-shard-00-02.6mzunvs.mongodb.net:27017/test?ssl=true&replicaSet=atlas-asahlb-shard-0&authSource=admin&retryWrites=true&w=majority';
mongoose.connect(uri).then(async () => {
    const db = mongoose.connection.db;
    const results = await db.collection('quizz_results').find({ studentId: { $in: ['st035', 'ST035'] } }).toArray();
    console.log('st035 quiz results:');
    results.forEach(r => console.log(r.quizId, r.score, r.studentId));
    process.exit(0);
});
