const mongoose = require('mongoose');
const uri = 'mongodb://root:root@ac-xc33ipv-shard-00-00.6mzunvs.mongodb.net:27017,ac-xc33ipv-shard-00-01.6mzunvs.mongodb.net:27017,ac-xc33ipv-shard-00-02.6mzunvs.mongodb.net:27017/test?ssl=true&replicaSet=atlas-asahlb-shard-0&authSource=admin&retryWrites=true&w=majority';
mongoose.connect(uri)
  .then(async () => {
    const db = mongoose.connection.db;
    const notifs = await db.collection('notifications').find({ relatedStudentId: { $regex: new RegExp('st031', 'i') } }).toArray();
    console.log('Notifications for st031:', notifs);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
