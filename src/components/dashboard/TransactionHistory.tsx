import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from '@/lib/firebase';
import { UserService } from '@/lib/user-service';
import { Loader2, Download, Search, Filter, Calendar, Eye, X, Check, AlertCircle } from 'lucide-react';
import { VisaIcon, MastercardIcon, PayPalIcon, BankIcon, MpesaIcon, AirtelMoneyIcon } from '@/assets/payment-icons';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Transaction {
  txId: string;
  timestamp: string;
  type: string;
  asset: string;
  amount: number;
  status: string;
  method?: string;
  network?: string;
  metadata?: Record<string, any>;
  details?: {
    expectedCompletionTime?: string;
  };
}

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        const userData = await UserService.getUserData(uid);
        if (userData && userData.transactions) {
          setTransactions(userData.transactions);
          setFilteredTransactions(userData.transactions);
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  useEffect(() => {
    // Apply all filters
    let result = [...transactions];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (tx) => 
          tx.txId.toLowerCase().includes(query) || 
          tx.asset.toLowerCase().includes(query) ||
          tx.type.toLowerCase().includes(query)
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      result = result.filter((tx) => tx.type.toLowerCase() === typeFilter.toLowerCase());
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((tx) => tx.status.toLowerCase() === statusFilter.toLowerCase());
    }

    // Date range filter
    if (startDate) {
      const start = new Date(startDate).getTime();
      result = result.filter((tx) => new Date(tx.timestamp).getTime() >= start);
    }

    if (endDate) {
      const end = new Date(endDate).getTime();
      result = result.filter((tx) => new Date(tx.timestamp).getTime() <= end);
    }

    setFilteredTransactions(result);
  }, [transactions, searchQuery, typeFilter, statusFilter, startDate, endDate]);

  const getStatusColor = (status: string): string => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-500/20 text-green-500 border-green-500/50';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50';
      case 'processing':
        return 'bg-blue-500/20 text-blue-500 border-blue-500/50';
      case 'failed':
        return 'bg-red-500/20 text-red-500 border-red-500/50';
      case 'cancelled':
        return 'bg-gray-500/20 text-gray-500 border-gray-500/50';
      default:
        return 'bg-gray-500/20 text-gray-500 border-gray-500/50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <Check className="w-4 h-4 mr-1" />;
      case 'pending':
      case 'processing':
        return <Loader2 className="w-4 h-4 mr-1 animate-spin" />;
      case 'failed':
      case 'cancelled':
        return <X className="w-4 h-4 mr-1" />;
      default:
        return <AlertCircle className="w-4 h-4 mr-1" />;
    }
  };

  const formatAmount = (amount: number | undefined, asset: string): string => {
    if (amount === undefined) {
      return `$0.00`;
    }

    const formattedNumber = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    }).format(amount);

    return `$${formattedNumber}`;
  };

  const formatDate = (timestamp: string): string => {
    if (!timestamp) return 'N/A';
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZoneName: 'short'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const exportTransactions = (format: 'csv' | 'pdf') => {
    if (format === 'csv') {
      const headers = ['Date/Time', 'Type', 'Asset', 'Amount', 'Status', 'Transaction ID', 'Method/Network'];
      const csvContent = [
        headers.join(','),
        ...filteredTransactions.map(tx => [
          formatDate(tx.timestamp),
          tx.type,
          tx.asset,
          tx.amount,
          tx.status,
          tx.txId,
          tx.method || tx.network || 'N/A'
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `transactions_${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // For PDF, we would typically use a library like jsPDF
      // This is a placeholder for future implementation
      alert('PDF export will be implemented soon');
    }
  };

  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDetailsOpen(true);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setStatusFilter('all');
    setStartDate('');
    setEndDate('');
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
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <CardTitle className="text-xl text-white">Transaction History</CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          {/* Search bar */}
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by ID or asset..."
              className="pl-9 bg-background/20 border-white/10 text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filters dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-white/10 text-white">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-background/95 backdrop-blur-lg border-white/10 text-white">
              <div className="p-2 space-y-2">
                <div className="space-y-1">
                  <label className="text-xs text-white/70">Type</label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="bg-background/20 border-white/10 text-white">
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent className="bg-background/95 backdrop-blur-lg border-white/10 text-white">
                      <SelectItem value="all">All types</SelectItem>
                      <SelectItem value="deposit">Deposit</SelectItem>
                      <SelectItem value="withdrawal">Withdrawal</SelectItem>
                      <SelectItem value="trade">Trade</SelectItem>
                      <SelectItem value="transfer">Transfer</SelectItem>
                      <SelectItem value="fee">Fee</SelectItem>
                      <SelectItem value="referral">Referral Bonus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-white/70">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="bg-background/20 border-white/10 text-white">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent className="bg-background/95 backdrop-blur-lg border-white/10 text-white">
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-white/70">Date Range</label>
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      className="bg-background/20 border-white/10 text-white"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                    <Input
                      type="date"
                      className="bg-background/20 border-white/10 text-white"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full bg-transparent border-white/10 text-white hover:bg-white/5"
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Export options */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-white/10 text-white">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-background/95 backdrop-blur-lg border-white/10 text-white">
              <DropdownMenuItem onClick={() => exportTransactions('csv')} className="cursor-pointer hover:bg-white/5">
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportTransactions('pdf')} className="cursor-pointer hover:bg-white/5">
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent>
        {filteredTransactions.length === 0 ? (
          <div className="text-center text-white/70 py-8 space-y-2">
            <p>No transactions found</p>
            {(searchQuery || typeFilter !== 'all' || statusFilter !== 'all' || startDate || endDate) && (
              <Button variant="outline" className="border-white/10 text-white" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-white/5">
                  <TableHead className="text-white/70">Date/Time</TableHead>
                  <TableHead className="text-white/70">Type</TableHead>
                  <TableHead className="text-white/70">Asset</TableHead>
                  <TableHead className="text-white/70 text-right">Amount</TableHead>
                  <TableHead className="text-white/70">Status</TableHead>
                  <TableHead className="text-white/70">Transaction ID</TableHead>
                  <TableHead className="text-white/70">Method/Network</TableHead>
                  <TableHead className="text-white/70 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.txId} className="border-white/10 hover:bg-white/5">
                    <TableCell className="text-white">
                      {formatDate(transaction.timestamp)}
                    </TableCell>
                    <TableCell className="text-white">
                      {transaction.type}
                    </TableCell>
                    <TableCell className="text-white flex items-center gap-2">
                      <img 
                        src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/usdt.svg" 
                        alt="USDT" 
                        className="w-5 h-5" 
                      />
                      USDT
                    </TableCell>
                    <TableCell className="text-white text-right">
                      {formatAmount(transaction.amount, transaction.asset)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`flex items-center ${getStatusColor(transaction.status)}`}>
                        {getStatusIcon(transaction.status)}
                        {transaction.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-white font-mono text-xs">
                      {transaction.txId.substring(0, 8)}...
                    </TableCell>
                    <TableCell className="text-white">
                      <div className="flex items-center gap-2">
                        {transaction.method ? (
                          <>
                            {transaction.method.toLowerCase().includes('visa') && (
                              <VisaIcon className="w-5 h-5" />
                            )}
                            {transaction.method.toLowerCase().includes('mastercard') && (
                              <MastercardIcon className="w-5 h-5" />
                            )}
                            {transaction.method.toLowerCase().includes('paypal') && (
                              <PayPalIcon className="w-5 h-5" />
                            )}
                            {transaction.method.toLowerCase().includes('bank') && (
                              <BankIcon className="w-5 h-5 text-white" />
                            )}
                            {transaction.method.toLowerCase().includes('mpesa') && (
                              <MpesaIcon className="w-5 h-5" />
                            )}
                            {transaction.method.toLowerCase().includes('airtel') && (
                              <AirtelMoneyIcon className="w-5 h-5" />
                            )}
                            {transaction.method}
                          </>
                        ) : transaction.network ? (
                          <>
                            {transaction.network === 'ERC20' && (
                              <img src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/eth.svg" alt="ETH" className="w-5 h-5" />
                            )}
                            {transaction.network === 'TRC20' && (
                              <img src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/trx.svg" alt="TRX" className="w-5 h-5" />
                            )}
                            {transaction.network === 'BSC' && (
                              <img src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/bnb.svg" alt="BNB" className="w-5 h-5" />
                            )}
                            {transaction.network === 'SOLANA' && (
                              <img src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/sol.svg" alt="SOL" className="w-5 h-5" />
                            )}
                            {transaction.network === 'NATIVE' && transaction.asset === 'BTC' && (
                              <img src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/btc.svg" alt="BTC" className="w-5 h-5" />
                            )}
                            {transaction.network}
                          </>
                        ) : (
                          'N/A'
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-white hover:bg-white/10"
                        onClick={() => handleViewDetails(transaction)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Transaction Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="bg-background/95 backdrop-blur-lg border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription className="text-white/70">
              Full details for transaction ID: {selectedTransaction?.txId}
            </DialogDescription>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-white/70">Date & Time</p>
                  <p className="text-white">{formatDate(selectedTransaction.timestamp)}</p>
                </div>
                <div>
                  <p className="text-sm text-white/70">Status</p>
                  <Badge variant="outline" className={`flex items-center w-fit ${getStatusColor(selectedTransaction.status)}`}>
                    {getStatusIcon(selectedTransaction.status)}
                    {selectedTransaction.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-white/70">Type</p>
                  <p className="text-white">{selectedTransaction.type}</p>
                </div>
                <div>
                  <p className="text-sm text-white/70">Asset</p>
                  <p className="text-white flex items-center gap-2">
                    <img 
                      src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/usdt.svg" 
                      alt="USDT" 
                      className="w-5 h-5" 
                    />
                    USDT
                  </p>
                </div>
                <div>
                  <p className="text-sm text-white/70">Amount</p>
                  <p className="text-white">{formatAmount(selectedTransaction.amount, selectedTransaction.asset)}</p>
                </div>
                <div>
                  <p className="text-sm text-white/70">Method/Network</p>
                  <p className="text-white flex items-center gap-2">
                    {selectedTransaction.method ? (
                      <>
                        {selectedTransaction.method.toLowerCase().includes('visa') && (
                          <VisaIcon className="w-5 h-5" />
                        )}
                        {selectedTransaction.method.toLowerCase().includes('mastercard') && (
                          <MastercardIcon className="w-5 h-5" />
                        )}
                        {selectedTransaction.method.toLowerCase().includes('paypal') && (
                          <PayPalIcon className="w-5 h-5" />
                        )}
                        {selectedTransaction.method.toLowerCase().includes('bank') && (
                          <BankIcon className="w-5 h-5 text-white" />
                        )}
                        {selectedTransaction.method.toLowerCase().includes('mpesa') && (
                          <MpesaIcon className="w-5 h-5" />
                        )}
                        {selectedTransaction.method.toLowerCase().includes('airtel') && (
                          <AirtelMoneyIcon className="w-5 h-5" />
                        )}
                        {selectedTransaction.method}
                      </>
                    ) : selectedTransaction.network ? (
                      <>
                        {selectedTransaction.network === 'ERC20' && (
                          <img src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/eth.svg" alt="ETH" className="w-5 h-5" />
                        )}
                        {selectedTransaction.network === 'TRC20' && (
                          <img src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/trx.svg" alt="TRX" className="w-5 h-5" />
                        )}
                        {selectedTransaction.network === 'BSC' && (
                          <img src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/bnb.svg" alt="BNB" className="w-5 h-5" />
                        )}
                        {selectedTransaction.network === 'SOLANA' && (
                          <img src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/sol.svg" alt="SOL" className="w-5 h-5" />
                        )}
                        {selectedTransaction.network === 'NATIVE' && selectedTransaction.asset === 'BTC' && (
                          <img src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/btc.svg" alt="BTC" className="w-5 h-5" />
                        )}
                        {selectedTransaction.network}
                      </>
                    ) : (
                      'N/A'
                    )}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-white/70">Transaction ID</p>
                  <p className="text-white font-mono break-all">{selectedTransaction.txId}</p>
                </div>

                {selectedTransaction.details?.expectedCompletionTime && selectedTransaction.status === 'pending' && (
                  <div>
                    <p className="text-sm text-white/70">Expected Completion</p>
                    <p className="text-white">{formatDate(selectedTransaction.details.expectedCompletionTime)}</p>
                  </div>
                )}

                {/* Metadata if available */}
                {selectedTransaction.metadata && Object.keys(selectedTransaction.metadata).length > 0 && (
                  <div className="col-span-2 border-t border-white/10 pt-4 mt-2">
                    <p className="text-sm text-white/70 mb-2">Additional Details</p>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(selectedTransaction.metadata).map(([key, value]) => (
                        <div key={key}>
                          <p className="text-sm text-white/70">{key.charAt(0).toUpperCase() + key.slice(1)}</p>
                          <p className="text-white break-all">{String(value)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                {selectedTransaction.status === 'pending' && (
                  <Button variant="destructive" size="sm">
                    Cancel Transaction
                  </Button>
                )}
                <Button 
                  variant="outline"
                  size="sm"
                  className="border-white/10 text-white"
                  onClick={() => exportTransactions('pdf')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Receipt
                </Button>
                <Button 
                  variant="default"
                  size="sm"
                  onClick={() => setIsDetailsOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default TransactionHistory;