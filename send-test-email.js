
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Since we can't directly import TypeScript, let's create a simple test
// that mimics the email service functionality
import nodemailer from 'nodemailer';

async function testEmailService() {
  console.log('🧪 Testing email service...');
  
  try {
    // Create transporter with the same config as the email service
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'kelvinkelly3189@gmail.com',
        pass: process.env.EMAIL_PASS || 'zozj kjez thsb adhs'
      }
    });

    // Test connection
    await transporter.verify();
    console.log('✅ Email service connection verified');

    // Send test withdrawal email
    const testEmail = {
      from: '"Vertex Trading" <kelvinkelly3189@gmail.com>',
      to: 'kelvinkelly3189@gmail.com',
      subject: 'Vertex Withdrawal Confirmation - Test',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Vertex Trading - Test Email</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #0c0c0f 0%, #181a20 50%, #1e2329 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="color: #f2ff44; margin: 0; font-size: 24px;">VERTEX TRADING</h1>
            </div>
            
            <div style="background: #ffffff; padding: 40px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h2 style="color: #181a20; margin-bottom: 20px;">Test Email - Withdrawal Processed</h2>
                
                <p>Hello Test User,</p>
                
                <p>This is a test email to verify that your email templates are working correctly with the new Gmail design.</p>
                
                <div style="background: #f8fffe; border: 1px solid #e1f5f5; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <p style="margin: 0; color: #008080; font-weight: 600;">✅ Email Service Status: Working</p>
                </div>
                
                <p style="color: #666; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                    This is an automated test message from Vertex Trading. Please do not reply to this email.
                </p>
            </div>
        </body>
        </html>
      `
    };

    const result = await transporter.sendMail(testEmail);
    console.log('✅ Test email sent successfully:', result.messageId);
    console.log('📧 Email sent to: kelvinkelly3189@gmail.com');
    
    // Close the transporter
    transporter.close();
    
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Email test failed:', error);
    return { success: false, error: error.message };
  }
}

// Run the test
testEmailService()
  .then(result => {
    if (result.success) {
      console.log('\n🎉 Email service test completed successfully!');
      console.log('📬 Check your inbox for the test email.');
      process.exit(0);
    } else {
      console.error('\n💥 Email service test failed!');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });
