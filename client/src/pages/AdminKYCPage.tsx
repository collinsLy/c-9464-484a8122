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
import { 
  CheckCircle, XCircle, Clock, Eye, MessageSquare, Users, 
  Settings, LogOut, Search, Filter, Download, Calendar,
  FileText, Camera, CreditCard, Home, Mail, Bell, BarChart3,
  Shield, Activity, TrendingUp, Flag, Ban, Edit, Trash2
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

  // Comprehensive admin states
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userFilterStatus, setUserFilterStatus] = useState('all');
  
  // Message composition
  const [messageSubject, setMessageSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [messageChannel, setMessageChannel] = useState<'email' | 'in-app' | 'push'>('email');
  
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
      });
      
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
      await AdminService.sendSystemBroadcast(systemMessage);
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

          {activeTab === 'users' && (
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-400">
                  User management features coming soon...
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'messaging' && (
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Messaging System</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-400">
                  Messaging features coming soon...
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'system' && (
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">System Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-400">
                  System update features coming soon...
                </div>
              </CardContent>
            </Card>
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