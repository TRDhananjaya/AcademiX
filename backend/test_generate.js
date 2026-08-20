const mongoose = require('mongoose');
const { generateStudyPlanAsync } = require('./services/studyPlanService');
require('dotenv').config();

const uri = 'mongodb://root:root@ac-xc33ipv-shard-00-00.6mzunvs.mongodb.net:27017,ac-xc33ipv-shard-00-01.6mzunvs.mongodb.net:27017,ac-xc33ipv-shard-00-02.6mzunvs.mongodb.net:27017/test?ssl=true&replicaSet=atlas-asahlb-shard-0&authSource=admin&retryWrites=true&w=majority';

mongoose.connect(uri)
  .then(async () => {
    console.log('Connected to DB. Running generateStudyPlanAsync...');
    // Lesson 1 ID: 6a33c6b4d67ba7d81f63916b
    await generateStudyPlanAsync('st031', 'Student 31', '6a33c6b4d67ba7d81f63916b');
    console.log('Finished generateStudyPlanAsync');
    
    // verify the study plan was saved
    const StudyPlan = require('./models/StudyPlan');
    const plans = await StudyPlan.find({ studentId: 'st031' });
    console.log('Found plans for st031:', plans.length);
    if(plans.length > 0) {
       console.log('Successfully saved study plan:', plans[0]._id);
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
