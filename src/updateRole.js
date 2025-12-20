require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function updateRoles() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Emails to update
    const emails = ['basiledward72@gmail.com', 'yayq254@gmail.com'];

    for (const email of emails) {
      const user = await User.findOneAndUpdate(
        { email: email.toLowerCase() },
        { role: 'admin' },
        { new: true }
      );

      if (user) {
        console.log(`Updated ${email} to admin role`);
      } else {
        console.log(`User ${email} not found`);
      }
    }

    console.log('Role updates completed');
  } catch (error) {
    console.error('Error updating roles:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

updateRoles();
