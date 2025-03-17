
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

interface TransactionHistoryProps {
  isDemoMode?: boolean;
}

const TransactionHistory = ({ isDemoMode = false }: TransactionHistoryProps) => {
  // Demo transactions with predefined values
  const demoTransactions = [
    { id: 1, type: "Buy", asset: "Bitcoin", amount: 0.05, price: 65432, total: 3271.60, date: new Date().toISOString().split('T')[0] },
    { id: 2, type: "Buy", asset: "Ethereum", amount: 1.5, price: 3245, total: 4867.50, date: new Date().toISOString().split('T')[0] },
    { id: 3, type: "Buy", asset: "Solana", amount: 14.8, price: 152, total: 2249.60, date: new Date().toISOString().split('T')[0] },
  ];
  
  // Show empty state for live mode since there's no real data
  const liveTransactions: typeof demoTransactions = [];
  
  const transactions = isDemoMode ? demoTransactions : liveTransactions;
  
  return (
    <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{isDemoMode ? "Demo Transactions" : "Recent Transactions"}</CardTitle>
        {transactions.length > 0 && (
          <a href="#" className="text-sm text-accent hover:underline">View All</a>
        )}
      </CardHeader>
      <CardContent>
        {transactions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="border-white/10">
                <TableHead>Type</TableHead>
                <TableHead>Asset</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id} className="border-white/10">
                  <TableCell className={tx.type === 'Buy' ? 'text-green-400' : 'text-red-400'}>
                    {tx.type}
                  </TableCell>
                  <TableCell>{tx.asset}</TableCell>
                  <TableCell>{tx.amount}</TableCell>
                  <TableCell>${tx.price.toLocaleString()}</TableCell>
                  <TableCell>${tx.total.toLocaleString()}</TableCell>
                  <TableCell>{tx.date}</TableCell>
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
