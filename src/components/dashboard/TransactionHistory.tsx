
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { UserService } from "@/lib/user-service";

interface TransactionHistoryProps {
  isDemoMode?: boolean;
}

interface Transaction {
  type: string;
  method: string;
  amount: number;
  status: string;
  timestamp: string;
  details?: {
    paymentMethod?: string;
  };
}

const TransactionHistory = ({ isDemoMode = false }: TransactionHistoryProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!isDemoMode) {
        const uid = localStorage.getItem('userId');
        if (uid) {
          const userData = await UserService.getUserData(uid);
          if (userData && userData.transactions) {
            setTransactions(userData.transactions);
          }
        }
      }
    };

    fetchTransactions();
  }, [isDemoMode]);

  // Demo transactions with predefined values
  const demoTransactions = [
    { 
      type: "withdrawal",
      method: "bank",
      amount: 1000,
      status: "completed",
      timestamp: new Date().toISOString(),
      details: { paymentMethod: "Bank Transfer" }
    },
    { 
      type: "deposit",
      method: "card",
      amount: 5000,
      status: "completed",
      timestamp: new Date().toISOString(),
      details: { paymentMethod: "Credit Card" }
    }
  ];

  const displayTransactions = isDemoMode ? demoTransactions : transactions;

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatMethod = (method: string, details?: { paymentMethod?: string }) => {
    const methodMap: { [key: string]: string } = {
      bank: "Bank Transfer",
      paypal: "PayPal",
      mpesa: "M-Pesa",
      airtel: "Airtel Money",
      card: "Credit Card"
    };
    return details?.paymentMethod || methodMap[method] || method;
  };

  return (
    <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{isDemoMode ? "Demo Transactions" : "Transaction History"}</CardTitle>
      </CardHeader>
      <CardContent>
        {displayTransactions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="border-white/10">
                <TableHead>Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayTransactions.map((tx, index) => (
                <TableRow key={index} className="border-white/10">
                  <TableCell>{formatDate(tx.timestamp)}</TableCell>
                  <TableCell className={tx.type === 'deposit' ? 'text-green-400' : 'text-red-400'}>
                    {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                  </TableCell>
                  <TableCell>{formatMethod(tx.method, tx.details)}</TableCell>
                  <TableCell>${tx.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      tx.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-white/60">
            <p>No transaction history</p>
            <p className="text-sm mt-2">Your recent transactions will appear here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;
