import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, XCircle, Clock, Eye, MessageSquare, Users, 
  Settings, LogOut, Search, Filter, Download, Calendar,
  FileText, Camera, CreditCard, Home, Mail, Bell, BarChart3,
  Shield, Activity, TrendingUp, Flag, Ban, Edit, Trash2,
  TestTube, Send, Loader2, AlertTriangle, Megaphone, Plus,
  ArrowUpDown, RefreshCw, DollarSign, UserCheck, UserX,
  Zap, Globe, Database, Lock, Unlock, AlertCircle, Star,
  PhoneCall, MapPin, ExternalLink, Copy, Archive, History,
  PieChart, LineChart, TrendingDown, Users2, Target,
  ShieldCheck, ShieldAlert, BookOpen, HelpCircle, Info,
  Wrench, ServerCrash, Bug, Terminal
} from "lucide-react";
import { kycService, KYCSubmission } from "@/lib/kyc-service";
import { toast } from "@/components/ui/use-toast";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { isAdmin } from "@/lib/admin-auth";
import { AdminService, AdminUser, AdminMessage, AdminAnalytics } from '@/lib/admin-service';
import { ScrollArea } from "@/components/ui/scroll-area";

const AdminKYCPage = () => {
  const [submissions, setSubmissions] = useState<KYCSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<KYCSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<KYCSubmission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [reviewComment, setReviewComment] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [authChecking, setAuthChecking] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Messaging system state
  const [messageSubject, setMessageSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [messageChannel, setMessageChannel] = useState<'email' | 'in-app' | 'push'>('email');
  const [messagePriority, setMessagePriority] = useState<'low' | 'normal' | 'high'>('normal');
  const [selectedMessageUsers, setSelectedMessageUsers] = useState<string[]>([]);
  const [systemBroadcastSubject, setSystemBroadcastSubject] = useState('');
  const [systemBroadcastBody, setSystemBroadcastBody] = useState('');
  const [systemBroadcastChannel, setSystemBroadcastChannel] = useState<'email' | 'in-app' | 'push'>('email');
  const [systemBroadcastPriority, setSystemBroadcastPriority] = useState<'low' | 'normal' | 'high'>('normal');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Comprehensive admin states
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userFilterStatus, setUserFilterStatus] = useState('all');
  
  // System broadcast
  const [systemMessage, setSystemMessage] = useState('');

  const loadDashboardData = async () => {
    try {
      console.log('Loading dashboard data...');
      const [analyticsData, usersData, messagesData] = await Promise.all([
        AdminService.getAnalytics(),
        AdminService.getAllUsers(),
        AdminService.getMessages()
      ]);
      
      console.log('Analytics:', analyticsData);
      console.log('Users:', usersData);
      console.log('Messages:', messagesData);
      
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
    }
  };

  // Messaging system handlers
  const handleSendTargetedMessage = async () => {
    if (!messageSubject || !messageBody || selectedMessageUsers.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields and select at least one recipient",
        variant: "destructive",
      });
      return;
    }

    setIsSendingMessage(true);
    try {
      const result = await AdminService.sendTargetedMessage({
        recipients: selectedMessageUsers,
        subject: messageSubject,
        body: messageBody,
        channel: messageChannel,
        priority: messagePriority,
        senderId: 'admin-system' // Replace with actual admin user ID
      });

      if (result.success) {
        toast({
          title: "Message Sent",
          description: `Successfully delivered to ${result.deliveredTo.length} users`,
        });
        
        // Reset form
        setMessageSubject('');
        setMessageBody('');
        setSelectedMessageUsers([]);
      } else {
        toast({
          title: "Partial Failure",
          description: `Delivered to ${result.deliveredTo.length}, failed: ${result.failedTo.length}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error sending targeted message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleSendSystemBroadcast = async () => {
    if (!systemBroadcastSubject || !systemBroadcastBody) {
      toast({
        title: "Validation Error",
        description: "Please fill in subject and message body",
        variant: "destructive",
      });
      return;
    }

    setIsSendingMessage(true);
    try {
      // Get all user emails
      const allUserEmails = users.map(user => user.email);
      
      const result = await AdminService.sendSystemBroadcast({
        subject: systemBroadcastSubject,
        body: systemBroadcastBody,
        channel: systemBroadcastChannel,
        priority: systemBroadcastPriority,
        senderId: 'admin-system' // Replace with actual admin user ID
      }, allUserEmails);

      if (result.success) {
        toast({
          title: "Broadcast Sent",
          description: `System message delivered to ${result.deliveredTo.length} users`,
        });
        
        // Reset form
        setSystemBroadcastSubject('');
        setSystemBroadcastBody('');
      } else {
        toast({
          title: "Partial Failure",
          description: `Delivered to ${result.deliveredTo.length}, failed: ${result.failedTo.length}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error sending system broadcast:', error);
      toast({
        title: "Error",
        description: "Failed to send broadcast",
        variant: "destructive",
      });
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleTestMessaging = async () => {
    try {
      const result = await AdminService.testMessagingService();
      toast({
        title: "Test Result",
        description: result.success ? "Messaging service is working correctly" : "Messaging service test failed",
        variant: result.success ? "default" : "destructive",
      });
    } catch (error) {
      console.error('Error testing messaging:', error);
      toast({
        title: "Test Failed",
        description: "Unable to test messaging service",
        variant: "destructive",
      });
    }
  };

  const handleUserAction = async (userId: string, action: 'block' | 'unblock' | 'flag' | 'unflag') => {
    try {
      await AdminService.updateUserStatus(userId, action);
      toast({
        title: "Success",
        description: `User ${action}ed successfully`,
      });
      loadDashboardData(); // Refresh data
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} user`,
        variant: "destructive",
      });
    }
  };

  // Handler for duplicate detection
  const handleDetectDuplicates = async () => {
    try {
      const duplicates = await AdminService.detectDuplicateAccounts();
      toast({
        title: "Scan Complete",
        description: `Found ${duplicates.length} potential duplicate accounts`,
      });
      console.log('Duplicate accounts found:', duplicates);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to scan for duplicates",
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
      await AdminService.sendMessage({
        subject: messageSubject,
        body: messageBody,
        recipients: selectedUsers,
        channel: messageChannel
      }, 'admin-system');
      
      toast({
        title: "Message Sent",
        description: `Message sent to ${selectedUsers.length} users`,
      });
      
      setMessageSubject('');
      setMessageBody('');
      setSelectedUsers([]);
      loadDashboardData(); // Refresh data
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
      await AdminService.broadcastSystemUpdate(systemMessage, 'admin-system');
      toast({
        title: "Broadcast Sent",
        description: "System message sent to all users",
      });
      setSystemMessage('');
      loadDashboardData(); // Refresh data
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send broadcast",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    let hasRedirected = false;
    
    // Wait for auth state to be determined, then check if user is admin
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (hasRedirected) return; // Prevent multiple redirects
      
      console.log('Auth state changed:', user?.email || 'no user');
      setAuthChecking(false);
      setAuthInitialized(true);
      
      if (user === null) {
        // User is definitely not logged in - redirect to login instead of home
        console.log('No user found, redirecting to login');
        hasRedirected = true;
        window.location.replace('/dashboard'); // Users need to login first
        return;
      }
      
      if (user && !isAdmin(user)) {
        // User is logged in but not admin
        console.log('User not admin, redirecting to dashboard');
        hasRedirected = true;
        window.location.replace('/dashboard');
        return;
      }
      
      if (user && isAdmin(user)) {
        // User is logged in and is admin
        console.log('Admin user confirmed, loading submissions');
        setIsAuthorized(true);
        // Small delay to ensure state is set
        setTimeout(() => {
          loadSubmissions();
          loadDashboardData();
        }, 100);
      }
    });

    // Timeout fallback in case auth never resolves
    const timeout = setTimeout(() => {
      if (!authInitialized && !hasRedirected) {
        console.log('Auth timeout, redirecting to home');
        hasRedirected = true;
        window.location.replace('/');
      }
    }, 5000);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, [authInitialized]);

  useEffect(() => {
    filterSubmissions();
  }, [submissions, filterStatus, searchTerm]);

  const loadSubmissions = async () => {
    try {
      setIsLoading(true);
      console.log('Loading KYC submissions...');
      const data = await kycService.getAllKYCSubmissions();
      console.log('Loaded submissions:', data.length);
      setSubmissions(data);
    } catch (error) {
      console.error('Error loading submissions:', error);
      // Don't show error immediately, might be permissions issue
      setSubmissions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterSubmissions = () => {
    let filtered = submissions;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(sub => sub.status === filterStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(sub => 
        sub.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.personalInfo.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredSubmissions(filtered);
  };

  const handleStatusUpdate = async (submissionId: string, status: 'approved' | 'rejected' | 'under_review') => {
    try {
      setIsProcessing(true);
      await kycService.updateKYCStatus(submissionId, status, reviewComment);
      
      toast({
        title: "Status Updated",
        description: `KYC application has been ${status}`,
      });

      await loadSubmissions();
      setIsDetailDialogOpen(false);
      setReviewComment('');
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update KYC status",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'under_review':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'id_front':
      case 'id_back':
        return <CreditCard className="w-4 h-4" />;
      case 'selfie':
        return <Camera className="w-4 h-4" />;
      case 'proof_of_address':
        return <Home className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const exportToCSV = () => {
    const csvData = filteredSubmissions.map(sub => ({
      'User Name': sub.userName,
      'Email': sub.userEmail,
      'Status': sub.status,
      'Submitted': sub.submittedAt.toLocaleDateString(),
      'Country': sub.personalInfo.country,
      'Document Type': sub.personalInfo.documentType
    }));

    const csvString = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kyc-submissions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Add loading state to prevent page flicker
  if (authChecking || !authInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f1115]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-white">Checking authorization...</p>
          <p className="text-gray-400 text-sm mt-2">Please wait while we verify your admin privileges</p>
        </div>
      </div>
    );
  }

  // If not authorized after auth check, show access denied
  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f1115]">
        <div className="text-center max-w-md mx-auto p-6">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Admin Access Required</h2>
          <p className="text-gray-400 mb-6">Please log in to access the admin panel. If you're already logged in, you may need admin privileges.</p>
          <div className="space-y-3">
            <Button 
              onClick={() => window.location.href = '/dashboard'}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Go to Dashboard & Login
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.reload()}
              className="w-full border-gray-600 text-white hover:bg-gray-800"
            >
              Refresh Page
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Debug: Auth State - {authInitialized ? 'Initialized' : 'Not Initialized'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1115]">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-white">Vertex Admin Panel</h1>
            <Badge className="bg-blue-600 text-white">
              KYC Management System
            </Badge>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/dashboard'}
              className="text-white border-gray-600 hover:bg-gray-800"
            >
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-white border-gray-600 hover:bg-gray-800"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-900 min-h-screen p-6">
          <nav className="space-y-2">
            <Button
              variant={activeTab === 'overview' ? 'default' : 'ghost'}
              className="w-full justify-start text-white"
              onClick={() => setActiveTab('overview')}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </Button>
            <Button
              variant={activeTab === 'users' ? 'default' : 'ghost'}
              className="w-full justify-start text-white"
              onClick={() => setActiveTab('users')}
            >
              <Users className="w-4 h-4 mr-2" />
              User Management
            </Button>
            <Button
              variant={activeTab === 'messaging' ? 'default' : 'ghost'}
              className="w-full justify-start text-white"
              onClick={() => setActiveTab('messaging')}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Messaging
            </Button>
            <Button
              variant={activeTab === 'kyc' ? 'default' : 'ghost'}
              className="w-full justify-start text-white"
              onClick={() => setActiveTab('kyc')}
            >
              <FileText className="w-4 h-4 mr-2" />
              KYC Review
            </Button>
            <Button
              variant={activeTab === 'security' ? 'default' : 'ghost'}
              className="w-full justify-start text-white"
              onClick={() => setActiveTab('security')}
            >
              <Shield className="w-4 h-4 mr-2" />
              Security
            </Button>
            <Button
              variant={activeTab === 'system' ? 'default' : 'ghost'}
              className="w-full justify-start text-white"
              onClick={() => setActiveTab('system')}
            >
              <Settings className="w-4 h-4 mr-2" />
              Legacy Tools
            </Button>
          </nav>

          <div className="mt-8 p-4 bg-gray-800 rounded-lg">
            <h3 className="text-sm font-semibold text-white mb-2">Quick Stats</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex justify-between">
                <span>Pending:</span>
                <span>{submissions.filter(s => s.status === 'pending').length}</span>
              </div>
              <div className="flex justify-between">
                <span>Under Review:</span>
                <span>{submissions.filter(s => s.status === 'under_review').length}</span>
              </div>
              <div className="flex justify-between">
                <span>Approved:</span>
                <span>{submissions.filter(s => s.status === 'approved').length}</span>
              </div>
              <div className="flex justify-between">
                <span>Rejected:</span>
                <span>{submissions.filter(s => s.status === 'rejected').length}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6">
          {activeTab === 'kyc' && (
            <div className="space-y-6">
              {/* Controls */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-gray-800 border-gray-600 text-white w-64"
                    />
                  </div>
                  
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-48 bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportToCSV}
                    disabled={filteredSubmissions.length === 0}
                    className="text-white border-gray-600 hover:bg-gray-800"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadSubmissions}
                    disabled={isLoading}
                    className="text-white border-gray-600 hover:bg-gray-800"
                  >
                    {isLoading ? 'Loading...' : 'Refresh'}
                  </Button>
                </div>
              </div>

              {/* KYC Table */}
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">KYC Submissions ({filteredSubmissions.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-white">Loading submissions...</span>
                    </div>
                  ) : filteredSubmissions.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      No KYC submissions found matching your criteria.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-700">
                          <TableHead className="text-gray-300">User</TableHead>
                          <TableHead className="text-gray-300">Status</TableHead>
                          <TableHead className="text-gray-300">Submitted</TableHead>
                          <TableHead className="text-gray-300">Country</TableHead>
                          <TableHead className="text-gray-300">Document</TableHead>
                          <TableHead className="text-gray-300">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSubmissions.map((submission) => (
                          <TableRow key={submission.id} className="border-gray-700">
                            <TableCell>
                              <div>
                                <div className="font-medium text-white">{submission.userName}</div>
                                <div className="text-sm text-gray-400">{submission.userEmail}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(submission.status)}>
                                <span className="flex items-center gap-1">
                                  {getStatusIcon(submission.status)}
                                  {submission.status.replace('_', ' ').toUpperCase()}
                                </span>
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-300">{submission.submittedAt.toLocaleDateString()}</TableCell>
                            <TableCell className="text-gray-300">{submission.personalInfo.country}</TableCell>
                            <TableCell className="text-gray-300">{submission.personalInfo.documentType.replace('_', ' ')}</TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedSubmission(submission);
                                  setIsDetailDialogOpen(true);
                                }}
                                className="text-white border-gray-600 hover:bg-gray-800"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                Review
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          )}



          {/* Overview Tab - Dashboard Analytics */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gray-900 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Users className="h-8 w-8 text-blue-400"/>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-400">Total Users</p>
                        <p className="text-2xl font-bold text-white">{analytics?.totalUsers || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gray-900 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <UserCheck className="h-8 w-8 text-green-400"/>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-400">New Today</p>
                        <p className="text-2xl font-bold text-white">{analytics?.newUsersToday || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gray-900 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Shield className="h-8 w-8 text-purple-400"/>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-400">KYC Pending</p>
                        <p className="text-2xl font-bold text-white">{analytics?.kycSubmissions.pending || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gray-900 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Clock className="h-8 w-8 text-yellow-400"/>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-400">Avg. Processing</p>
                        <p className="text-2xl font-bold text-white">{analytics?.averageKycProcessingTime.toFixed(1) || '0'}h</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* KYC Status Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">KYC Status Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Pending</span>
                        <Badge className="bg-yellow-100 text-yellow-800">{analytics?.kycSubmissions.pending || 0}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Under Review</span>
                        <Badge className="bg-blue-100 text-blue-800">{analytics?.kycSubmissions.under_review || 0}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Approved</span>
                        <Badge className="bg-green-100 text-green-800">{analytics?.kycSubmissions.approved || 0}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Rejected</span>
                        <Badge className="bg-red-100 text-red-800">{analytics?.kycSubmissions.rejected || 0}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">System Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Platform Status</span>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-green-400">Operational</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Email Service</span>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-green-400">Connected</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Database</span>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-green-400">Online</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* User Management Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">User Management</h2>
                <div className="flex gap-2">
                  <Button variant="outline" className="text-white border-gray-600 hover:bg-gray-800">
                    <Download className="w-4 h-4 mr-2" />
                    Export Users
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </div>

              {/* User Filters */}
              <Card className="bg-gray-900 border-gray-700">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search users..."
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                        className="pl-10 bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                    <Select value={userFilterStatus} onValueChange={setUserFilterStatus}>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue placeholder="KYC Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" className="text-white border-gray-600 hover:bg-gray-800">
                      <Filter className="w-4 h-4 mr-2" />
                      More Filters
                    </Button>
                    <Button variant="outline" className="text-white border-gray-600 hover:bg-gray-800">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Users Table */}
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">All Users ({users.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-300">User</TableHead>
                        <TableHead className="text-gray-300">Balance</TableHead>
                        <TableHead className="text-gray-300">KYC Status</TableHead>
                        <TableHead className="text-gray-300">Joined</TableHead>
                        <TableHead className="text-gray-300">Country</TableHead>
                        <TableHead className="text-gray-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.slice(0, 10).map((user) => (
                        <TableRow key={user.id} className="border-gray-700">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-medium">
                                  {user.fullName?.charAt(0) || user.email.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium text-white">{user.fullName || 'No name'}</div>
                                <div className="text-sm text-gray-400">{user.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-300">
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              {user.balance.toFixed(2)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(user.kycStatus || 'pending')}>
                              {user.kycStatus || 'pending'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {user.createdAt?.toLocaleDateString() || 'Unknown'}
                          </TableCell>
                          <TableCell className="text-gray-300">{user.country || 'Unknown'}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-white border-gray-600 hover:bg-gray-800"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUserAction(user.id, user.isBlocked ? 'unblock' : 'block')}
                                className="text-white border-gray-600 hover:bg-gray-800"
                              >
                                {user.isBlocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUserAction(user.id, user.isFlagged ? 'unflag' : 'flag')}
                                className="text-white border-gray-600 hover:bg-gray-800"
                              >
                                <Flag className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'messaging' && (
            <div className="space-y-6">
              {/* Test Messaging Service */}
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Messaging Service Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handleTestMessaging}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <TestTube className="w-4 h-4 mr-2" />
                    Test Messaging Service
                  </Button>
                </CardContent>
              </Card>

              {/* Email Templates Library */}
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Email Templates Library</CardTitle>
                  <p className="text-gray-400">Quick access to pre-designed email templates</p>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-auto max-h-[600px]">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                        <h4 className="text-white font-medium mb-2">Welcome Message</h4>
                        <p className="text-gray-400 text-sm mb-3">Welcome new users to the platform</p>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setMessageSubject('Welcome to Vertex Trading Platform');
                            setMessageBody('Dear {{username}},\n\nWelcome to Vertex Trading! We\'re excited to have you join our community of traders.\n\nYour account has been successfully created and you can now:\n• Trade cryptocurrencies with competitive fees\n• Access advanced trading tools\n• Participate in our rewards program\n\nIf you have any questions, our support team is here to help.\n\nBest regards,\nThe Vertex Trading Team');
                          }}
                          className="w-full text-white border-gray-600 hover:bg-gray-700"
                        >
                          Use Template
                        </Button>
                      </div>

                    <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                        <h4 className="text-white font-medium mb-2">Security Alert</h4>
                        <p className="text-gray-400 text-sm mb-3">Important security notifications</p>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setMessageSubject('Important Security Notice');
                            setMessageBody('Dear {{username}},\n\nWe detected some important activity on your account that requires your attention.\n\nFor your security, please:\n• Review your recent login activity\n• Enable two-factor authentication if not already active\n• Ensure your email and phone number are up to date\n\nIf you have any concerns, please contact our security team immediately.\n\nBest regards,\nVertex Trading Security Team');

                          }}
                          className="w-full text-white border-gray-600 hover:bg-gray-700"
                        >
                          Use Template
                        </Button>
                      </div>

                      <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                        <h4 className="text-white font-medium mb-2">Maintenance Notice</h4>
                        <p className="text-gray-400 text-sm mb-3">System maintenance announcements</p>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setMessageSubject('Scheduled System Maintenance');
                            setMessageBody('Dear {{username}},\n\nWe will be performing scheduled maintenance on our platform to improve your trading experience.\n\nMaintenance Details:\n• Date: [DATE]\n• Duration: [TIME RANGE]\n• Services Affected: [SERVICES]\n\nDuring this time, you may experience:\n• Temporary inability to place new orders\n• Brief login interruptions\n• Delayed notifications\n\nWe apologize for any inconvenience and appreciate your patience.\n\nBest regards,\nVertex Trading Operations Team');
                          }}
                          className="w-full text-white border-gray-600 hover:bg-gray-700"
                        >
                          Use Template
                        </Button>
                      </div>

                      <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                        <h4 className="text-white font-medium mb-2">KYC Reminder</h4>
                        <p className="text-gray-400 text-sm mb-3">KYC verification reminders</p>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setMessageSubject('Complete Your KYC Verification');
                            setMessageBody('Dear {{username}},\n\nTo unlock full access to your Vertex Trading account, please complete your KYC verification.\n\nBenefits of completing KYC:\n• Higher withdrawal limits\n• Access to premium features\n• Enhanced account security\n• Priority customer support\n\nThe verification process takes only a few minutes:\n1. Upload a government-issued ID\n2. Take a selfie for identity verification\n3. Provide proof of address\n\nStart your verification now through your dashboard.\n\nBest regards,\nVertex Trading Compliance Team');
                          }}
                          className="w-full text-white border-gray-600 hover:bg-gray-700"
                        >
                          Use Template
                        </Button>
                      </div>

                      <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                        <h4 className="text-white font-medium mb-2">Promotional Offer</h4>
                        <p className="text-gray-400 text-sm mb-3">Special offers and promotions</p>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setMessageSubject('Exclusive Trading Offer - Limited Time');
                            setMessageBody('Dear {{username}},\n\nWe have an exclusive offer just for you!\n\n🎉 Special Promotion Details:\n• Reduced trading fees for 30 days\n• Bonus rewards on deposits\n• Free access to premium analytics\n\nThis offer is valid until [DATE] and available to verified users only.\n\nTo activate this offer:\n1. Log into your account\n2. Make a qualifying deposit\n3. Start trading with reduced fees\n\nDon\'t miss out on this limited-time opportunity!\n\nBest regards,\nVertex Trading Marketing Team');

                          }}
                          className="w-full text-white border-gray-600 hover:bg-gray-700"
                        >
                          Use Template
                        </Button>
                      </div>

                      <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                        <h4 className="text-white font-medium mb-2">Account Update</h4>
                        <p className="text-gray-400 text-sm mb-3">Account status updates</p>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setMessageSubject('Your Account Has Been Updated');
                            setMessageBody('Dear {{username}},\n\nYour Vertex Trading account has been successfully updated.\n\nChanges Made:\n• [LIST OF CHANGES]\n\nWhat This Means:\n• [EXPLANATION OF IMPACT]\n• [NEXT STEPS IF ANY]\n\nIf you have questions about these changes or need assistance, please contact our support team.\n\nYour account security and trading experience remain our top priorities.\n\nBest regards,\nVertex Trading Support Team');
                          }}
                          className="w-full text-white border-gray-600 hover:bg-gray-700"
                        >
                          Use Template
                        </Button>
                      </div>

                      <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                        <h4 className="text-white font-medium mb-2">KYC Status Update</h4>
                        <p className="text-gray-400 text-sm mb-3">KYC approval/rejection notifications</p>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setMessageSubject('KYC Verification Status Update');
                            setMessageBody('Dear {{username}},\n\nWe have an update regarding your KYC verification status.\n\nStatus: {{status}}\n\n{{#if approved}}\nCongratulations! Your identity verification has been approved. You now have access to:\n• Full withdrawal privileges\n• Higher transaction limits\n• Premium trading features\n• Priority customer support\n{{/if}}\n\n{{#if rejected}}\nUnfortunately, we were unable to verify your identity at this time.\n\nReason: {{rejection_reason}}\n\nYou can resubmit your verification with updated documents through your dashboard.\n{{/if}}\n\n{{#if under_review}}\nYour documents are currently under review. We\'ll notify you once the verification is complete.\n\nExpected processing time: 1-3 business days\n{{/if}}\n\nBest regards,\nVertex Trading Compliance Team');
                          }}
                          className="w-full text-white border-gray-600 hover:bg-gray-700"
                        >
                          Use Template
                        </Button>
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Targeted Messaging */}
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Send Targeted Message</CardTitle>
                  <p className="text-gray-400">Send messages to specific users</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="messageSubject" className="text-white">Subject</Label>
                      <Input
                        id="messageSubject"
                        value={messageSubject}
                        onChange={(e) => setMessageSubject(e.target.value)}
                        className="bg-gray-800 border-gray-600 text-white"
                        placeholder="Message subject..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="messageChannel" className="text-white">Channel</Label>
                      <Select value={messageChannel} onValueChange={(value: 'email' | 'in-app' | 'push') => setMessageChannel(value)}>
                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="in-app">In-App</SelectItem>
                          <SelectItem value="push">Push Notification</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="messageBody" className="text-white">Message Body</Label>
                    <Textarea
                      id="messageBody"
                      value={messageBody}
                      onChange={(e) => setMessageBody(e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white min-h-[100px]"
                      placeholder="Enter your message content..."
                    />
                  </div>

                  <div>
                    <Label className="text-white">Select Recipients</Label>
                    <div className="mt-2 max-h-48 overflow-y-auto border border-gray-600 rounded p-2 bg-gray-800">
                      {users.map((user) => (
                        <div key={user.id} className="flex items-center space-x-2 py-1">
                          <input
                            type="checkbox"
                            id={`user-${user.id}`}
                            checked={selectedMessageUsers.includes(user.email)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedMessageUsers([...selectedMessageUsers, user.email]);
                              } else {
                                setSelectedMessageUsers(selectedMessageUsers.filter(email => email !== user.email));
                              }
                            }}
                            className="rounded"
                          />
                          <label htmlFor={`user-${user.id}`} className="text-white text-sm">
                            {user.email} {user.fullName ? `(${user.fullName})` : ''}
                          </label>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-400 mt-2">
                      {selectedMessageUsers.length} recipient(s) selected
                    </p>
                  </div>

                  <Button
                    onClick={handleSendTargetedMessage}
                    disabled={isSendingMessage || !messageSubject || !messageBody || selectedMessageUsers.length === 0}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isSendingMessage ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Targeted Message
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* System Broadcast */}
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">System Broadcast</CardTitle>
                  <p className="text-gray-400">Send messages to all users</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="systemBroadcastSubject" className="text-white">Subject</Label>
                      <Input
                        id="systemBroadcastSubject"
                        value={systemBroadcastSubject}
                        onChange={(e) => setSystemBroadcastSubject(e.target.value)}
                        className="bg-gray-800 border-gray-600 text-white"
                        placeholder="System broadcast subject..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="systemBroadcastChannel" className="text-white">Channel</Label>
                      <Select value={systemBroadcastChannel} onValueChange={(value: 'email' | 'in-app' | 'push') => setSystemBroadcastChannel(value)}>
                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="in-app">In-App</SelectItem>
                          <SelectItem value="push">Push Notification</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="systemBroadcastBody" className="text-white">Message Body</Label>
                    <Textarea
                      id="systemBroadcastBody"
                      value={systemBroadcastBody}
                      onChange={(e) => setSystemBroadcastBody(e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white min-h-[100px]"
                      placeholder="Enter system broadcast message..."
                    />
                  </div>

                  <div className="bg-yellow-900/20 border border-yellow-700 rounded p-3">
                    <div className="flex items-center gap-2 text-yellow-300">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="font-medium">Warning</span>
                    </div>
                    <p className="text-sm text-yellow-200 mt-1">
                      This will send a message to all {users.length} registered users. Use with caution.
                    </p>
                  </div>

                  <Button
                    onClick={handleSendSystemBroadcast}
                    disabled={isSendingMessage || !systemBroadcastSubject || !systemBroadcastBody}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    {isSendingMessage ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Broadcasting...
                      </>
                    ) : (
                      <>
                        <Megaphone className="w-4 h-4 mr-2" />
                        Send System Broadcast
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Security & Fraud Management</h2>
              
              {/* Fraud Detection */}
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Fraud Detection</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                        <span className="text-red-400 font-medium">High Risk</span>
                      </div>
                      <p className="text-2xl font-bold text-white mt-2">3</p>
                      <p className="text-gray-400 text-sm">Flagged Accounts</p>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-yellow-400" />
                        <span className="text-yellow-400 font-medium">Under Review</span>
                      </div>
                      <p className="text-2xl font-bold text-white mt-2">7</p>
                      <p className="text-gray-400 text-sm">Pending Verification</p>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-blue-400" />
                        <span className="text-blue-400 font-medium">Verified</span>
                      </div>
                      <p className="text-2xl font-bold text-white mt-2">94</p>
                      <p className="text-gray-400 text-sm">Clean Accounts</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleDetectDuplicates}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Search className="w-4 h-4 mr-2" />
                      Detect Duplicates
                    </Button>
                    <Button variant="outline" className="text-white border-gray-600 hover:bg-gray-800">
                      <Download className="w-4 h-4 mr-2" />
                      Export Report
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Security Actions */}
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Security Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-white border-gray-600 hover:bg-gray-800"
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Force Password Reset
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-white border-gray-600 hover:bg-gray-800"
                    >
                      <Ban className="w-4 h-4 mr-2" />
                      Suspend Account
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-white border-gray-600 hover:bg-gray-800"
                    >
                      <Flag className="w-4 h-4 mr-2" />
                      Flag for Review
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-white border-gray-600 hover:bg-gray-800"
                    >
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Request Re-verification
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Notification Management</h2>
              
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Push Notifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white">Notification Title</Label>
                      <Input 
                        placeholder="Enter notification title"
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-white">Target Audience</Label>
                      <Select>
                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                          <SelectValue placeholder="Select audience" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Users</SelectItem>
                          <SelectItem value="verified">Verified Users</SelectItem>
                          <SelectItem value="pending">Pending KYC</SelectItem>
                          <SelectItem value="high_value">High Value Users</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-white">Message Content</Label>
                    <Textarea 
                      placeholder="Enter notification message"
                      className="bg-gray-800 border-gray-600 text-white min-h-[100px]"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch />
                    <Label className="text-white">Send immediately</Label>
                  </div>
                  
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Send className="w-4 h-4 mr-2" />
                    Send Notification
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Audit Logs Tab */}
          {activeTab === 'audit' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Audit Logs</h2>
              
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">System Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-300">Timestamp</TableHead>
                        <TableHead className="text-gray-300">Admin</TableHead>
                        <TableHead className="text-gray-300">Action</TableHead>
                        <TableHead className="text-gray-300">Target</TableHead>
                        <TableHead className="text-gray-300">Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="border-gray-700">
                        <TableCell className="text-gray-300">2025-07-25 08:15:30</TableCell>
                        <TableCell className="text-gray-300">admin@vertex.com</TableCell>
                        <TableCell className="text-gray-300">KYC_APPROVED</TableCell>
                        <TableCell className="text-gray-300">user123@email.com</TableCell>
                        <TableCell className="text-gray-300">Document verification completed</TableCell>
                      </TableRow>
                      <TableRow className="border-gray-700">
                        <TableCell className="text-gray-300">2025-07-25 08:10:15</TableCell>
                        <TableCell className="text-gray-300">admin@vertex.com</TableCell>
                        <TableCell className="text-gray-300">USER_BLOCKED</TableCell>
                        <TableCell className="text-gray-300">suspicious@email.com</TableCell>
                        <TableCell className="text-gray-300">Fraud detection triggered</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* System Configuration Tab */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">System Configuration</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Platform Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Maintenance Mode</span>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">New User Registration</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">KYC Required for Trading</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Email Notifications</span>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">API Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-white">Rate Limit (requests/minute)</Label>
                      <Input 
                        defaultValue="100"
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-white">Max File Size (MB)</Label>
                      <Input 
                        defaultValue="10"
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-white">Session Timeout (minutes)</Label>
                      <Input 
                        defaultValue="30"
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Admin Tools Tab */}
          {activeTab === 'tools' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Advanced Admin Tools</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Database Tools</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-white border-gray-600 hover:bg-gray-800"
                    >
                      <Database className="w-4 h-4 mr-2" />
                      Database Backup
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-white border-gray-600 hover:bg-gray-800"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Clear Cache
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-white border-gray-600 hover:bg-gray-800"
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Generate Reports
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Communication</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button 
                      onClick={handleTestMessaging}
                      className="w-full justify-start bg-blue-600 hover:bg-blue-700"
                    >
                      <TestTube className="w-4 h-4 mr-2" />
                      Test Messaging
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-white border-gray-600 hover:bg-gray-800"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Email Templates
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-white border-gray-600 hover:bg-gray-800"
                    >
                      <Megaphone className="w-4 h-4 mr-2" />
                      System Announcements
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Debug & Monitoring</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-white border-gray-600 hover:bg-gray-800"
                    >
                      <Terminal className="w-4 h-4 mr-2" />
                      System Logs
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-white border-gray-600 hover:bg-gray-800"
                    >
                      <Activity className="w-4 h-4 mr-2" />
                      Performance Monitor
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-white border-gray-600 hover:bg-gray-800"
                    >
                      <Bug className="w-4 h-4 mr-2" />
                      Error Tracking
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* KYC Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">KYC Application Review</DialogTitle>
          </DialogHeader>
          
          {selectedSubmission && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2 text-white">User Information</h4>
                  <div className="space-y-1 text-sm text-gray-300">
                    <p><strong>Name:</strong> {selectedSubmission.userName}</p>
                    <p><strong>Email:</strong> {selectedSubmission.userEmail}</p>
                    <p><strong>Submitted:</strong> {selectedSubmission.submittedAt.toLocaleString()}</p>
                    {selectedSubmission.reviewedAt && (
                      <p><strong>Reviewed:</strong> {selectedSubmission.reviewedAt.toLocaleString()}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2 text-white">Personal Details</h4>
                  <div className="space-y-1 text-sm text-gray-300">
                    <p><strong>Full Name:</strong> {selectedSubmission.personalInfo.fullName}</p>
                    <p><strong>DOB:</strong> {selectedSubmission.personalInfo.dateOfBirth}</p>
                    <p><strong>Country:</strong> {selectedSubmission.personalInfo.country}</p>
                    <p><strong>Document:</strong> {selectedSubmission.personalInfo.documentType} - {selectedSubmission.personalInfo.documentNumber}</p>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <h4 className="font-semibold mb-2 text-white">Address</h4>
                <p className="text-sm text-gray-300">{selectedSubmission.personalInfo.address}</p>
              </div>

              {/* Documents */}
              <div>
                <h4 className="font-semibold mb-2 text-white">Uploaded Documents</h4>
                <div className="grid grid-cols-2 gap-4">
                  {selectedSubmission.documents.map((doc, index) => (
                    <div key={index} className="border border-gray-700 rounded-lg p-4 bg-gray-800">
                      <div className="flex items-center gap-2 mb-2">
                        {getDocumentIcon(doc.type)}
                        <span className="text-sm font-medium text-white">
                          {doc.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>
                      <img 
                        src={doc.url} 
                        alt={doc.type}
                        className="w-full h-32 object-cover rounded mb-2"
                      />
                      <p className="text-xs text-gray-400">{doc.fileName}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Previous Comments */}
              {selectedSubmission.adminComments && (
                <div>
                  <h4 className="font-semibold mb-2 text-white">Previous Review Comments</h4>
                  <div className="bg-gray-800 p-3 rounded border border-gray-700">
                    <p className="text-sm text-gray-300">{selectedSubmission.adminComments}</p>
                  </div>
                </div>
              )}

              {/* Review Section */}
              <div className="border-t border-gray-700 pt-4">
                <h4 className="font-semibold mb-4 text-white">Review Actions</h4>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="reviewComment" className="text-white">Review Comment</Label>
                    <Textarea
                      id="reviewComment"
                      placeholder="Add your review comments..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleStatusUpdate(selectedSubmission.id!, 'under_review')}
                      disabled={isProcessing}
                      className="text-white border-gray-600 hover:bg-gray-800"
                    >
                      <Clock className="w-4 h-4 mr-1" />
                      Under Review
                    </Button>
                    <Button
                      onClick={() => handleStatusUpdate(selectedSubmission.id!, 'approved')}
                      disabled={isProcessing}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleStatusUpdate(selectedSubmission.id!, 'rejected')}
                      disabled={isProcessing}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminKYCPage;