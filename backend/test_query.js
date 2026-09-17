const mongoose = require('mongoose');
require('dotenv').config();
const Attendance = require('./models/Attendance');

async function testDateQuery(selectedDateStr) {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const [year, month, day] = selectedDateStr.split('-').map(Number);
    const utcStart = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    const localStart = new Date(year, month - 1, day, 0, 0, 0, 0);
    const start = new Date(Math.min(utcStart.getTime(), localStart.getTime()));

    const utcEnd = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
    const localEnd = new Date(year, month - 1, day, 23, 59, 59, 999);
    const end = new Date(Math.max(utcEnd.getTime(), localEnd.getTime()));

    console.log(`Querying for ${selectedDateStr}:`);
    console.log(`Start ISO: ${start.toISOString()}`);
    console.log(`End ISO:   ${end.toISOString()}`);

    const records = await Attendance.find({
      $or: [
        { date: { $gte: start, $lte: end } },
        { createdAt: { $gte: start, $lte: end } }
      ]
    }).populate('student');

    console.log(`Found ${records.length} records!`);
    records.forEach(r => {
      console.log(` - Student: ${r.student?.name || 'N/A'}, Time: ${r.timeArrived}, Date: ${r.date?.toISOString()}, CreatedAt: ${r.createdAt?.toISOString()}`);
    });

    mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

testDateQuery('2026-09-10');
