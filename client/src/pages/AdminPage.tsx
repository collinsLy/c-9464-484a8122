import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  Users, DollarSign, MessageSquare, BarChart3, Shield, Settings,
  Search, Filter, UserPlus, Mail, Bell, Eye, Edit, Trash2,
  CheckCircle, XCircle, Clock, AlertTriangle, TrendingUp,
  Activity, FileText, Download, Calendar, Flag, Ban
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { setUserBalance, setKelvinBalance } from '@/lib/set-user-balance';
import { AdminService, AdminUser, AdminMessage, AdminAnalytics } from '@/lib/admin-service';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { auth } from '@/lib/firebase';

export default function AdminPage() {
  // Legacy balance management states
  const [email, setEmail] = useState('');
  const [balance, setBalance] = useState('');
  const [loading, setLoading] = useState(false);
  
  // New comprehensive admin states
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  
  // Message composition
  const [messageSubject, setMessageSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [messageChannel, setMessageChannel] = useState<'email' | 'in-app' | 'push'>('email');
  
  // System broadcast
  const [systemMessage, setSystemMessage] = useState('');
  
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [analyticsData, usersData, messagesData] = await Promise.all([
        AdminService.getAnalytics(),
        AdminService.getAllUsers(),
        AdminService.getMessages()
      ]);
      
      setAnalytics(analyticsData);
      setUsers(usersData.users);
      setMessages(messagesData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Legacy balance functions
  const handleSetBalance = async () => {
    if (!email || !balance) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and balance",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const success = await setUserBalance(email, parseFloat(balance));
      if (success) {
        toast({
          title: "Success",
          description: `Balance updated for ${email} to $${balance}`,
        });
        setEmail('');
        setBalance('');
        loadDashboardData(); // Refresh data
      } else {
        toast({
          title: "Error",
          description: "User not found or update failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update balance",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSetKelvinBalance = async () => {
    setLoading(true);
    try {
      const success = await setKelvinBalance();
      if (success) {
        toast({
          title: "Success",
          description: "Kelvin's account restrictions removed - balance can now be managed normally",
        });
        loadDashboardData(); // Refresh data
      } else {
        toast({
          title: "Error",
          description: "Failed to remove restrictions",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update account settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // New comprehensive admin functions
  const handleUserAction = async (userId: string, action: 'block' | 'unblock' | 'flag' | 'unflag') => {
    try {
      const adminId = auth.currentUser?.uid || '';
      
      if (action === 'block' || action === 'unblock') {
        await AdminService.blockUser(userId, action === 'block', adminId);
      } else {
        await AdminService.flagUser(userId, action === 'flag', adminId);
      }
      
      toast({
        title: "Success",
        description: `User ${action}ed successfully`,
      });
      
      loadDashboardData();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} user`,
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async () => {
    if (!messageSubject || !messageBody || selectedUsers.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields and select recipients",
        variant: "destructive",
      });
      return;
    }

    try {
      const adminId = auth.currentUser?.uid || '';
      await AdminService.sendMessage({
        subject: messageSubject,
        body: messageBody,
        recipients: selectedUsers,
        channel: messageChannel
      }, adminId);

      toast({
        title: "Success",
        description: `Message sent to ${selectedUsers.length} users`,
      });

      setMessageSubject('');
      setMessageBody('');
      setSelectedUsers([]);
      loadDashboardData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleSystemBroadcast = async () => {
    if (!systemMessage) {
      toast({
        title: "Missing Information",
        description: "Please enter a system message",
        variant: "destructive",
      });
      return;
    }

    try {
      const adminId = auth.currentUser?.uid || '';
      await AdminService.broadcastSystemUpdate(systemMessage, adminId);

      toast({
        title: "Success",
        description: "System update broadcast successfully",
      });

      setSystemMessage('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to broadcast system update",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || user.kycStatus === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-600 text-white">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-600 text-white">Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-600 text-white">Pending</Badge>;
      case 'under_review':
        return <Badge className="bg-blue-600 text-white">Under Review</Badge>;
      default:
        return <Badge className="bg-gray-600 text-white">Not Submitted</Badge>;
    }
  };

  if (isLoading && !analytics) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-4 text-white text-lg">Loading admin dashboard...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-white/60">Comprehensive platform management and analytics</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-slate-800/50 border-slate-700">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="messaging" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Messaging
            </TabsTrigger>
            <TabsTrigger value="kyc" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              KYC Review
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="legacy" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Legacy Tools
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-white/60" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{analytics?.totalUsers || 0}</div>
                  <p className="text-xs text-white/60">
                    +{analytics?.newUsersToday || 0} today
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">KYC Pending</CardTitle>
                  <Clock className="h-4 w-4 text-white/60" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{analytics?.kycSubmissions.pending || 0}</div>
                  <p className="text-xs text-white/60">
                    Awaiting review
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Avg Processing</CardTitle>
                  <Activity className="h-4 w-4 text-white/60" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {analytics?.averageKycProcessingTime?.toFixed(1) || 0}h
                  </div>
                  <p className="text-xs text-white/60">
                    KYC review time
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">New This Week</CardTitle>
                  <TrendingUp className="h-4 w-4 text-white/60" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{analytics?.newUsersThisWeek || 0}</div>
                  <p className="text-xs text-white/60">
                    User signups
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">KYC Status Distribution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analytics && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-white/80">Approved</span>
                        <span className="text-green-400">{analytics.kycSubmissions.approved}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/80">Pending</span>
                        <span className="text-yellow-400">{analytics.kycSubmissions.pending}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/80">Under Review</span>
                        <span className="text-blue-400">{analytics.kycSubmissions.under_review}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/80">Rejected</span>
                        <span className="text-red-400">{analytics.kycSubmissions.rejected}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Recent System Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm text-white/60">
                      System monitoring and audit logs would appear here
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search users by email or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48 bg-slate-800 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending KYC</SelectItem>
                  <SelectItem value="approved">Approved KYC</SelectItem>
                  <SelectItem value="rejected">Rejected KYC</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">User Management ({filteredUsers.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700">
                        <TableHead className="text-white/80">Select</TableHead>
                        <TableHead className="text-white/80">User</TableHead>
                        <TableHead className="text-white/80">Balance</TableHead>
                        <TableHead className="text-white/80">KYC Status</TableHead>
                        <TableHead className="text-white/80">Country</TableHead>
                        <TableHead className="text-white/80">Joined</TableHead>
                        <TableHead className="text-white/80">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id} className="border-slate-700">
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(user.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedUsers([...selectedUsers, user.id]);
                                } else {
                                  setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                                }
                              }}
                              className="rounded border-slate-600"
                            />
                          </TableCell>
                          <TableCell>
                            <div className="text-white">
                              <div className="font-medium">{user.fullName || 'Unknown'}</div>
                              <div className="text-sm text-white/60">{user.email}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-white">
                            ${user.balance.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(user.kycStatus)}
                          </TableCell>
                          <TableCell className="text-white/80">
                            {user.country || 'N/A'}
                          </TableCell>
                          <TableCell className="text-white/80">
                            {user.createdAt?.toLocaleDateString() || 'N/A'}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant={user.isBlocked ? "destructive" : "outline"}
                                onClick={() => handleUserAction(user.id, user.isBlocked ? 'unblock' : 'block')}
                                className="text-xs"
                              >
                                {user.isBlocked ? <CheckCircle className="h-3 w-3" /> : <Ban className="h-3 w-3" />}
                              </Button>
                              <Button
                                size="sm"
                                variant={user.isFlagged ? "secondary" : "outline"}
                                onClick={() => handleUserAction(user.id, user.isFlagged ? 'unflag' : 'flag')}
                                className="text-xs"
                              >
                                <Flag className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messaging Tab */}
          <TabsContent value="messaging" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Compose Message</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-white">Subject</Label>
                    <Input
                      value={messageSubject}
                      onChange={(e) => setMessageSubject(e.target.value)}
                      className="bg-slate-800 border-slate-600 text-white"
                      placeholder="Message subject"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Message</Label>
                    <Textarea
                      value={messageBody}
                      onChange={(e) => setMessageBody(e.target.value)}
                      className="bg-slate-800 border-slate-600 text-white min-h-24"
                      placeholder="Type your message here..."
                    />
                  </div>
                  <div>
                    <Label className="text-white">Channel</Label>
                    <Select value={messageChannel} onValueChange={(value: 'email' | 'in-app' | 'push') => setMessageChannel(value)}>
                      <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="in-app">In-App Notification</SelectItem>
                        <SelectItem value="push">Push Notification</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="text-sm text-white/60">
                    Selected recipients: {selectedUsers.length} users
                  </div>
                  <Button 
                    onClick={handleSendMessage}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={selectedUsers.length === 0}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">System Broadcast</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-white">System Message</Label>
                    <Textarea
                      value={systemMessage}
                      onChange={(e) => setSystemMessage(e.target.value)}
                      className="bg-slate-800 border-slate-600 text-white min-h-24"
                      placeholder="System-wide announcement..."
                    />
                  </div>
                  <Button 
                    onClick={handleSystemBroadcast}
                    className="w-full bg-orange-600 hover:bg-orange-700"
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Broadcast to All Users
                  </Button>
                  <div className="text-xs text-white/60">
                    This will send the message to all platform users via email, in-app notification, and push notification.
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Recent Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  {messages.length > 0 ? (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div key={message.id} className="border-b border-slate-700 pb-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-white font-medium">{message.subject}</h4>
                            <Badge className={message.status === 'sent' ? 'bg-green-600' : 'bg-red-600'}>
                              {message.status}
                            </Badge>
                          </div>
                          <p className="text-white/60 text-sm mt-1">{message.body.substring(0, 100)}...</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-white/50">
                            <span>Recipients: {message.recipients.length}</span>
                            <span>Channel: {message.channel}</span>
                            <span>Sent: {message.sentAt?.toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-white/60">
                      No messages sent yet
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* KYC Review Tab */}
          <TabsContent value="kyc" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">KYC Review Interface</CardTitle>
                <p className="text-white/60">For detailed KYC review, use the dedicated admin KYC page</p>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => window.open('/admin-kyc', '_blank')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Open KYC Review Panel
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Security & Fraud Detection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={async () => {
                    try {
                      const duplicates = await AdminService.detectDuplicateAccounts();
                      if (duplicates.length > 0) {
                        toast({
                          title: "Duplicates Found",
                          description: `Found ${duplicates.length} potential duplicate accounts`,
                          variant: "destructive",
                        });
                      } else {
                        toast({
                          title: "No Duplicates",
                          description: "No duplicate accounts detected",
                        });
                      }
                    } catch (error) {
                      toast({
                        title: "Error",
                        description: "Failed to scan for duplicates",
                        variant: "destructive",
                      });
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Scan for Duplicate Accounts
                </Button>
                
                <div className="text-sm text-white/60">
                  This will check for users with duplicate email addresses, device information, or document IDs.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Legacy Tools Tab */}
          <TabsContent value="legacy" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Set User Balance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="text-white">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-slate-800 border-slate-600 text-white"
                      placeholder="user@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="balance" className="text-white">Balance ($)</Label>
                    <Input
                      id="balance"
                      type="number"
                      step="0.01"
                      value={balance}
                      onChange={(e) => setBalance(e.target.value)}
                      className="bg-slate-800 border-slate-600 text-white"
                      placeholder="0.00"
                    />
                  </div>
                  <Button 
                    onClick={handleSetBalance}
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? 'Updating...' : 'Set Balance'}
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={handleSetKelvinBalance}
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {loading ? 'Updating...' : 'Set Kelvin Balance to $72'}
                  </Button>
                  <p className="text-sm text-white/60 mt-2">
                    Sets kelvinkelly3189@gmail.com balance to $72
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}