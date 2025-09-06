require('dotenv').config();
const sendEmail = require('./utils/sendEmail');

const testEmail = async () => {
  try {
    console.log('Testing email configuration...');
    console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not set');
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'Not set');
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Please configure EMAIL_USER and EMAIL_PASS in .env file');
      return;
    }

    await sendEmail({
      to: process.env.EMAIL_USER, // Send to yourself for testing
      subject: 'Test Email - OTP Verification',
      text: 'This is a test email. Your OTP verification system is working!',
    });
    
    console.log('✅ Test email sent successfully!');
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    console.error('Full error:', error);
  }
};

testEmail();