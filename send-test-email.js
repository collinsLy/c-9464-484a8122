
import { emailService } from './server/email-service.ts';

async function sendTestEmail() {
  console.log('🧪 Sending test email...');
  
  try {
    // Send a test transaction email
    const result = await emailService.sendTransactionEmail(
      'kelvinkelly3189@gmail.com', // recipient
      'Test User',                 // username
      'deposit',                   // transaction type
      1000,                        // amount
    );

    if (result.success) {
      console.log('✅ Test email sent successfully!');
      console.log('📬 Message ID:', result.messageId);
      console.log('📧 Check your inbox at: kelvinkelly3189@gmail.com');
    } else {
      console.error('❌ Failed to send test email:', result.error);
    }

    // Also send a welcome email test
    console.log('\n🎉 Sending welcome email test...');
    const welcomeResult = await emailService.sendWelcomeEmail(
      'kelvinkelly3189@gmail.com',
      'Test User'
    );

    if (welcomeResult.success) {
      console.log('✅ Welcome email sent successfully!');
      console.log('📬 Message ID:', welcomeResult.messageId);
    } else {
      console.error('❌ Failed to send welcome email:', welcomeResult.error);
    }

  } catch (error) {
    console.error('❌ Error sending test emails:', error);
  }
}

// Run the test
sendTestEmail()
  .then(() => {
    console.log('\n🎉 Test email process completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });
