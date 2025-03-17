
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

const transactions = [
  { id: 1, type: "Buy", asset: "Bitcoin", amount: 0.12, price: 27300, total: 3276, date: "2023-11-01" },
  { id: 2, type: "Sell", asset: "Ethereum", amount: 1.5, price: 1850, total: 2775, date: "2023-10-28" },
  { id: 3, type: "Buy", asset: "Solana", amount: 10, price: 35.2, total: 352, date: "2023-10-25" },
  { id: 4, type: "Buy", asset: "BNB", amount: 2.4, price: 213, total: 511.2, date: "2023-10-22" },
  { id: 5, type: "Sell", asset: "Cardano", amount: 500, price: 0.31, total: 155, date: "2023-10-20" },
];

const TransactionHistory = () => {
  return (
    <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Transactions</CardTitle>
        <a href="#" className="text-sm text-accent hover:underline">View All</a>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;
