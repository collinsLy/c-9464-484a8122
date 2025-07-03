import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { emailNotificationService } from '@/lib/email-service';

export function EmailNotificationDemo() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('kelvinkelly3189@gmail.com');
  const [username, setUsername] = useState('Kelvin Kelly');
  const [transactionType, setTransactionType] = useState<'withdrawal' | 'deposit' | 'transfer' | 'conversion'>('withdrawal');
  const [amount, setAmount] = useState('1000');
  const [receiver, setReceiver] = useState('john.doe@example.com');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('BTC');
  const [conversionRate, setConversionRate] = useState('0.000024');
  
  const { toast } = useToast();

  const handleSendEmail = async () => {
    setIsLoading(true);
    try {
      let result;
      const amountNum = parseFloat(amount);
      
      switch (transactionType) {
        case 'withdrawal':
          result = await emailNotificationService.sendWithdrawalEmail(email, username, amountNum);
          break;
        case 'deposit':
          result = await emailNotificationService.sendDepositEmail(email, username, amountNum);
          break;
        case 'transfer':
          result = await emailNotificationService.sendTransferEmail(email, username, amountNum, receiver);
          break;
        case 'conversion':
          result = await emailNotificationService.sendConversionEmail(
            email, 
            username, 
            amountNum, 
            fromCurrency, 
            toCurrency, 
            parseFloat(conversionRate)
          );
          break;
      }

      if (result.success) {
        toast({
          title: "Email Sent Successfully",
          description: `${transactionType.charAt(0).toUpperCase() + transactionType.slice(1)} notification sent to ${email}`,
        });
      } else {
        toast({
          title: "Email Failed",
          description: result.error || "Unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send email notification",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestService = async () => {
    setIsLoading(true);
    try {
      const result = await emailNotificationService.testEmailService();
      if (result.success) {
        toast({
          title: "Email Service Test Successful",
          description: "Email service is working properly",
        });
      } else {
        toast({
          title: "Email Service Test Failed",
          description: result.error || "Unknown error",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Test Error",
        description: "Failed to test email service",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Email Notification System</CardTitle>
        <CardDescription>
          Test and send transaction email notifications using Gmail SMTP
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
            />
          </div>
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="John Doe"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="type">Transaction Type</Label>
            <Select value={transactionType} onValueChange={(value: any) => setTransactionType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select transaction type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="withdrawal">Withdrawal</SelectItem>
                <SelectItem value="deposit">Deposit</SelectItem>
                <SelectItem value="transfer">Transfer</SelectItem>
                <SelectItem value="conversion">Currency Conversion</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="1000"
            />
          </div>
        </div>

        {transactionType === 'transfer' && (
          <div>
            <Label htmlFor="receiver">Receiver</Label>
            <Input
              id="receiver"
              value={receiver}
              onChange={(e) => setReceiver(e.target.value)}
              placeholder="recipient@example.com"
            />
          </div>
        )}

        {transactionType === 'conversion' && (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="fromCurrency">From Currency</Label>
              <Input
                id="fromCurrency"
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                placeholder="USD"
              />
            </div>
            <div>
              <Label htmlFor="toCurrency">To Currency</Label>
              <Input
                id="toCurrency"
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                placeholder="BTC"
              />
            </div>
            <div>
              <Label htmlFor="conversionRate">Conversion Rate</Label>
              <Input
                id="conversionRate"
                type="number"
                step="0.000001"
                value={conversionRate}
                onChange={(e) => setConversionRate(e.target.value)}
                placeholder="0.000024"
              />
            </div>
          </div>
        )}

        <div className="flex gap-4 pt-4">
          <Button 
            onClick={handleSendEmail} 
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Sending...' : `Send ${transactionType.charAt(0).toUpperCase() + transactionType.slice(1)} Email`}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleTestService} 
            disabled={isLoading}
          >
            Test Service
          </Button>
        </div>

        <div className="pt-4 border-t">
          <h4 className="font-semibold mb-2">Email Configuration</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p><strong>SMTP Server:</strong> Gmail (smtp.gmail.com)</p>
            <p><strong>From Address:</strong> kelvinkelly3189@gmail.com</p>
            <p><strong>Authentication:</strong> App Password Enabled</p>
            <p><strong>Security:</strong> TLS/SSL Encryption</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}