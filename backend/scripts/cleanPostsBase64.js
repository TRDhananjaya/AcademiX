const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const CommunityPost = require('../models/CommunityPost');

async function cleanPosts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB Atlas');

    const posts = await CommunityPost.find({});
    let cleanedCount = 0;

    for (const post of posts) {
      let modified = false;
      if (post.authorAvatar && post.authorAvatar.startsWith('data:image')) {
        post.authorAvatar = '';
        modified = true;
      }
      if (Array.isArray(post.replies)) {
        post.replies.forEach(reply => {
          if (reply.authorAvatar && reply.authorAvatar.startsWith('data:image')) {
            reply.authorAvatar = '';
            modified = true;
          }
        });
      }
      if (modified) {
        await post.save();
        cleanedCount++;
      }
    }

    console.log(`Successfully cleaned ${cleanedCount} community posts with Base64 avatars.`);
  } catch (err) {
    console.error('Error cleaning posts:', err);
  } finally {
    await mongoose.disconnect();
  }
}

cleanPosts();
