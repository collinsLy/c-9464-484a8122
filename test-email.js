
const nodemailer = require('nodemailer');

// Test email configuration
const testEmailService = async () => {
  console.log('🧪 Testing email service...');
  
  try {
    // Create transporter with your Gmail credentials
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: 'kelvinkelly3189@gmail.com',
        pass: 'zozj kjez thsb adhs'
      }
    });

    // Test connection
    console.log('📡 Testing SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!');

    // Send test email
    console.log('📧 Sending test email...');
    const testEmail = {
      from: '"Vertex Trading Test" <kelvinkelly3189@gmail.com>',
      to: 'kelvinkelly3189@gmail.com', // Send to yourself for testing
      subject: 'Vertex Trading - Email Service Test',
      text: `
Hello!

This is a test email from your Vertex Trading application.

Test details:
- Timestamp: ${new Date().toISOString()}
- Service: Gmail SMTP
- Status: Working properly ✅

If you receive this email, your email service is configured correctly!

Best regards,
Vertex Trading Team
      `
    };

    const info = await transporter.sendMail(testEmail);
    console.log('✅ Test email sent successfully!');
    console.log('📬 Message ID:', info.messageId);
    console.log('📧 Email sent to:', testEmail.to);
    
    return true;
  } catch (error) {
    console.error('❌ Email service test failed:', error.message);
    return false;
  }
};

// Run the test
testEmailService()
  .then(success => {
    if (success) {
      console.log('\n🎉 Email service test completed successfully!');
      console.log('Your email configuration is working properly.');
    } else {
      console.log('\n❌ Email service test failed.');
      console.log('Please check your Gmail credentials and app password.');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });
