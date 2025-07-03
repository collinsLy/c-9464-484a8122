class EmailNotificationService {
  private baseUrl = window.location.origin;

  async sendTransactionEmail(
    email: string,
    username: string,
    type: 'withdrawal' | 'deposit' | 'transfer' | 'conversion',
    amount: number,
    receiver?: string,
    fromCurrency?: string,
    toCurrency?: string,
    conversionRate?: number
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
          fromCurrency,
          toCurrency,
          conversionRate,
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

  // Convenience methods for specific transaction types
  async sendWithdrawalEmail(email: string, username: string, amount: number) {
    return this.sendTransactionEmail(email, username, 'withdrawal', amount);
  }

  async sendDepositEmail(email: string, username: string, amount: number) {
    return this.sendTransactionEmail(email, username, 'deposit', amount);
  }

  async sendTransferEmail(email: string, username: string, amount: number, receiver: string) {
    return this.sendTransactionEmail(email, username, 'transfer', amount, receiver);
  }

  async sendConversionEmail(
    email: string, 
    username: string, 
    amount: number, 
    fromCurrency: string, 
    toCurrency: string, 
    conversionRate: number
  ) {
    return this.sendTransactionEmail(
      email, 
      username, 
      'conversion', 
      amount, 
      undefined, 
      fromCurrency, 
      toCurrency, 
      conversionRate
    );
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