class EmailNotificationService {
  private baseUrl = window.location.origin;

  async sendTransactionEmail(
    email: string,
    username: string,
    type: 'withdrawal' | 'deposit' | 'transfer',
    amount: number,
    receiver?: string
  ) {
    try {
      const response = await fetch(`${this.baseUrl}/api/send-transaction-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          username,
          type,
          amount,
          receiver,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error sending transaction email:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async sendWelcomeEmail(email: string, username: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/send-welcome-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          username,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async testEmailService() {
    try {
      const response = await fetch(`${this.baseUrl}/api/test-email`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error testing email service:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

export const emailNotificationService = new EmailNotificationService();