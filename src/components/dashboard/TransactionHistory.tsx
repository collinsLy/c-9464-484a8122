
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from '@/lib/firebase';
import { UserService } from '@/lib/user-service';
import { Loader2 } from 'lucide-react';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) return;
        
        const userData = await UserService.getUserData(uid);
        if (userData && userData.transactions) {
          setTransactions(userData.transactions);
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'text-green-500';
      case 'pending':
        return 'text-yellow-500';
      case 'failed':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (timestamp: string) => {
    if (!timestamp) return 'N/A';
    try {
      return new Date(timestamp).toLocaleString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <Card className="w-full bg-background/40 backdrop-blur-lg border-white/10">
        <CardHeader>
          <CardTitle className="text-xl text-white">Transaction History</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-white/70" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-background/40 backdrop-blur-lg border-white/10">
      <CardHeader>
        <CardTitle className="text-xl text-white">Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.length === 0 ? (
            <div className="text-center text-white/70 py-8">
              No transactions found
            </div>
          ) : (
            transactions.map((transaction: any, index: number) => (
              <div
                key={transaction.txId || index}
                className="flex justify-between items-center p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium text-white">
                    {transaction.type}
                  </p>
                  <p className="text-xs text-white/70">
                    {formatDate(transaction.timestamp)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-white">
                    {formatAmount(transaction.amount)}
                  </p>
                  <p className={`text-xs ${getStatusColor(transaction.status)}`}>
                    {transaction.status}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;
