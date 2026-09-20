const mongoose = require('mongoose');
const Notification = require('./models/Notification');
require('dotenv').config({ path: './.env' });

async function updateExistingNotifications() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/academix');
  
  console.log("Updating existing Underperformance Alerts in the database...");
  
  const notifications = await Notification.find({ notificationType: 'Underperformance Alert' });
  let count = 0;
  
  for (const notif of notifications) {
    if (notif.message && notif.message.includes('threshold') || notif.message.includes('teacher/sir')) {
      let updatedMessage = notif.message;
      updatedMessage = updatedMessage.replace('expected 50% threshold.', 'expected 50%.');
      updatedMessage = updatedMessage.replace('Please meet your teacher/sir to discuss', 'Please meet your teacher to discuss');
      
      // Handle the case where they might have newlines
      updatedMessage = updatedMessage.replace(/\n\nPlease meet/, ' Please meet');
      
      // Ensure the exact format is met
      // Format: Your predicted performance for "X" is below the expected 50%. Predicted Score: Y%. Please meet your teacher to discuss your performance and get guidance on how you can improve in this lesson.
      const match = updatedMessage.match(/Your predicted performance for "(.+?)" is below the expected 50%(\.?) Predicted Score: ([\d.]+)%\.?\s*Please meet your teacher to discuss your performance and get guidance on how you can improve in this lesson\./);
      
      if (match) {
        // It matches the general structure, let's normalize it perfectly
        notif.message = `Your predicted performance for "${match[1]}" is below the expected 50%. Predicted Score: ${match[3]}%. Please meet your teacher to discuss your performance and get guidance on how you can improve in this lesson.`;
      } else {
        // Fallback replacement if regex fails for some reason
        notif.message = updatedMessage;
      }
      
      await notif.save();
      count++;
    }
  }
  
  console.log(`Successfully updated ${count} existing notification(s) in the database.`);
  process.exit();
}

updateExistingNotifications();
