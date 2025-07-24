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
  FileText, Camera, CreditCard, Home, Mail, Bell
} from "lucide-react";
import { kycService, KYCSubmission } from "@/lib/kyc-service";
import { toast } from "@/components/ui/use-toast";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { isAdmin } from "@/lib/admin-auth";

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
  const [activeTab, setActiveTab] = useState('kyc');

  useEffect(() => {
    // Check if user is admin
    const user = auth.currentUser;
    if (!user || !isAdmin(user)) {
      window.location.href = '/';
      return;
    }
    loadSubmissions();
  }, []);

  useEffect(() => {
    filterSubmissions();
  }, [submissions, filterStatus, searchTerm]);

  const loadSubmissions = async () => {
    try {
      setIsLoading(true);
      const data = await kycService.getAllKYCSubmissions();
      setSubmissions(data);
    } catch (error) {
      console.error('Error loading submissions:', error);
      toast({
        title: "Error",
        description: "Failed to load KYC submissions",
        variant: "destructive"
      });
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
      'Reviewed': sub.reviewedAt?.toLocaleDateString() || 'N/A',
      'Country': sub.personalInfo.country,
      'Document Type': sub.personalInfo.documentType
    }));

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kyc-submissions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="text-xl font-bold text-primary">Vertex Admin</div>
            <Badge variant="secondary">KYC Management</Badge>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-card border-r min-h-[calc(100vh-4rem)]">
          <nav className="p-4 space-y-2">
            <Button 
              variant={activeTab === 'kyc' ? 'default' : 'ghost'} 
              className="w-full justify-start"
              onClick={() => setActiveTab('kyc')}
            >
              <FileText className="w-4 h-4 mr-2" />
              KYC Verifications
            </Button>
            <Button 
              variant={activeTab === 'users' ? 'default' : 'ghost'} 
              className="w-full justify-start"
              onClick={() => setActiveTab('users')}
            >
              <Users className="w-4 h-4 mr-2" />
              User Management
            </Button>
            <Button 
              variant={activeTab === 'messaging' ? 'default' : 'ghost'} 
              className="w-full justify-start"
              onClick={() => setActiveTab('messaging')}
            >
              <Mail className="w-4 h-4 mr-2" />
              Messaging
            </Button>
            <Button 
              variant={activeTab === 'system' ? 'default' : 'ghost'} 
              className="w-full justify-start"
              onClick={() => setActiveTab('system')}
            >
              <Bell className="w-4 h-4 mr-2" />
              System Updates
            </Button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === 'kyc' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="text-2xl font-bold">{submissions.length}</p>
                      </div>
                      <FileText className="w-8 h-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Pending</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {submissions.filter(s => s.status === 'pending').length}
                        </p>
                      </div>
                      <Clock className="w-8 h-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Approved</p>
                        <p className="text-2xl font-bold text-green-600">
                          {submissions.filter(s => s.status === 'approved').length}
                        </p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Rejected</p>
                        <p className="text-2xl font-bold text-red-600">
                          {submissions.filter(s => s.status === 'rejected').length}
                        </p>
                      </div>
                      <XCircle className="w-8 h-8 text-red-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filters and Search */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Search by name or email..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-[180px]">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="under_review">Under Review</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button variant="outline" onClick={exportToCSV}>
                      <Download className="w-4 h-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* KYC Submissions Table */}
              <Card>
                <CardHeader>
                  <CardTitle>KYC Submissions ({filteredSubmissions.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-8">Loading submissions...</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead>Country</TableHead>
                          <TableHead>Document Type</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSubmissions.map((submission) => (
                          <TableRow key={submission.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{submission.userName}</div>
                                <div className="text-sm text-muted-foreground">{submission.userEmail}</div>
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
                            <TableCell>{submission.submittedAt.toLocaleDateString()}</TableCell>
                            <TableCell>{submission.personalInfo.country}</TableCell>
                            <TableCell>{submission.personalInfo.documentType.replace('_', ' ')}</TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedSubmission(submission);
                                  setIsDetailDialogOpen(true);
                                }}
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
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  User management features coming soon...
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'messaging' && (
            <Card>
              <CardHeader>
                <CardTitle>Messaging System</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Messaging features coming soon...
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'system' && (
            <Card>
              <CardHeader>
                <CardTitle>System Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  System update features coming soon...
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>

      {/* KYC Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>KYC Application Review</DialogTitle>
          </DialogHeader>
          
          {selectedSubmission && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">User Information</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Name:</strong> {selectedSubmission.userName}</p>
                    <p><strong>Email:</strong> {selectedSubmission.userEmail}</p>
                    <p><strong>Submitted:</strong> {selectedSubmission.submittedAt.toLocaleString()}</p>
                    {selectedSubmission.reviewedAt && (
                      <p><strong>Reviewed:</strong> {selectedSubmission.reviewedAt.toLocaleString()}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Personal Details</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Full Name:</strong> {selectedSubmission.personalInfo.fullName}</p>
                    <p><strong>DOB:</strong> {selectedSubmission.personalInfo.dateOfBirth}</p>
                    <p><strong>Country:</strong> {selectedSubmission.personalInfo.country}</p>
                    <p><strong>Document:</strong> {selectedSubmission.personalInfo.documentType} - {selectedSubmission.personalInfo.documentNumber}</p>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <h4 className="font-semibold mb-2">Address</h4>
                <p className="text-sm">{selectedSubmission.personalInfo.address}</p>
              </div>

              {/* Documents */}
              <div>
                <h4 className="font-semibold mb-2">Uploaded Documents</h4>
                <div className="grid grid-cols-2 gap-4">
                  {selectedSubmission.documents.map((doc, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        {getDocumentIcon(doc.type)}
                        <span className="text-sm font-medium">
                          {doc.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>
                      <img 
                        src={doc.url} 
                        alt={doc.type}
                        className="w-full h-32 object-cover rounded mb-2"
                      />
                      <p className="text-xs text-muted-foreground">{doc.fileName}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Previous Comments */}
              {selectedSubmission.adminComments && (
                <div>
                  <h4 className="font-semibold mb-2">Previous Admin Comments</h4>
                  <div className="bg-muted p-3 rounded text-sm">
                    {selectedSubmission.adminComments}
                  </div>
                </div>
              )}

              {/* Review Actions */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="comment">Admin Comment</Label>
                  <Textarea
                    id="comment"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Add your review comments..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleStatusUpdate(selectedSubmission.id!, 'under_review')}
                    disabled={isProcessing}
                  >
                    <Clock className="w-4 h-4 mr-1" />
                    Under Review
                  </Button>
                  <Button
                    onClick={() => handleStatusUpdate(selectedSubmission.id!, 'approved')}
                    disabled={isProcessing}
                    className="bg-green-600 hover:bg-green-700"
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
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminKYCPage;