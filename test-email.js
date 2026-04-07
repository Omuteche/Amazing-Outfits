require('dotenv').config();
const sgMail = require('@sendgrid/mail');

// Set SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Define the email message
const msg = {
  to: 'basiledward72@gmail.com',
  from: process.env.FROM_EMAIL,
  subject: 'Test Email from Amazing Outfits',
  text: 'This is a test email sent using SendGrid.',
  html: '<strong>This is a test email sent using SendGrid.</strong>',
};

// Send the email
sgMail
  .send(msg)
  .then(() => {
    console.log('Test email sent successfully to basiledward72@gmail.com');
  })
  .catch((error) => {
    console.error('Error sending test email:', error);
  });
