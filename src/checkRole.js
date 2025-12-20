require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function checkRoles() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Emails to check
    const emails = ['basiledward72@gmail.com', 'yayq254@gmail.com'];

    for (const email of emails) {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (user) {
        console.log(`${email}: role = ${user.role}`);
      } else {
        console.log(`${email}: user not found`);
      }
    }

    console.log('Role check completed');
  } catch (error) {
    console.error('Error checking roles:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

checkRoles();
