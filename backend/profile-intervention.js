const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: './.env' });
async function run() {
  const token = jwt.sign({ id: '6a25ba1e06b53008d6150a8c', role: 'teacher' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
  
  const start = Date.now();
  try {
    const res = await fetch('http://localhost:5000/api/analytics/intervention', {
        headers: { 'Authorization': 'Bearer ' + token }
    });
    const time = Date.now() - start;
    console.log('Admin Intervention Time:', time, 'ms. Status:', res.status);
    
    // Test student one too
    const sStart = Date.now();
    const sRes = await fetch('http://localhost:5000/api/analytics/intervention/student/ST001', {
        headers: { 'Authorization': 'Bearer ' + token }
    });
    const sTime = Date.now() - sStart;
    console.log('Student Intervention Time:', sTime, 'ms. Status:', sRes.status);
    
  } catch(e) {
    console.error(e);
  }
}
run();
