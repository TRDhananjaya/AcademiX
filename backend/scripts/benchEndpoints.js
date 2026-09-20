const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

function getUrl(path, token) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path,
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        const elapsed = Date.now() - start;
        resolve({ statusCode: res.statusCode, elapsed, body });
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOne({ username: 'st001' });
  if (!user) {
    console.error('User st001 not found');
    await mongoose.disconnect();
    return;
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
  console.log(`JWT generated for user ${user.username} (${user._id}). Testing API latency...`);

  const cm = await getUrl('/api/common-messages', token);
  console.log(`[GET /api/common-messages] Status: ${cm.statusCode} | Latency: ${cm.elapsed} ms | Payload Size: ${(Buffer.byteLength(cm.body)/1024).toFixed(2)} KB`);

  const comm = await getUrl('/api/community', token);
  console.log(`[GET /api/community] Status: ${comm.statusCode} | Latency: ${comm.elapsed} ms | Payload Size: ${(Buffer.byteLength(comm.body)/1024).toFixed(2)} KB`);

  await mongoose.disconnect();
}

run().catch(err => console.error(err));
