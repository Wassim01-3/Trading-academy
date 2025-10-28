import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient, User, PurchaseRequest, Content, Announcement, MentorshipBooking } from "@/integrations/api/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { useUserActivity } from "@/hooks/use-user-activity";
import { LogOut, Users, FileText, UserPlus, ChevronDown, ChevronRight, Eye, Key, Calendar, Upload } from "lucide-react";
import logo from "@/assets/logo.png";

const Admin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [profiles, setProfiles] = useState<User[]>([]);
  const [content, setContent] = useState<Content[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [bookings, setBookings] = useState<MentorshipBooking[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  // New user form
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    plan: "basic" as "basic" | "advanced" | "premium",
  });

  // New post form (for posts with videos, files, etc.)
  const [newPost, setNewPost] = useState({
    title: "",
    description: "",
    videoUrl: "",
    pdfUrl: "",
    docUrl: "",
    imageUrl: "",
    orderIndex: 0,
  });

  // File upload loading states
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Link form (for community links)
  const [linkUrl, setLinkUrl] = useState("");

  // Content location selection
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [selectedMenu, setSelectedMenu] = useState<string>("");
  const [hoveredCategory, setHoveredCategory] = useState<string>("");
  const [menuDropdownOpen, setMenuDropdownOpen] = useState(false);
  const [submenuPosition, setSubmenuPosition] = useState<'left' | 'right'>('right');
  const [hoveredItemElement, setHoveredItemElement] = useState<HTMLElement | null>(null);
  const [showContentInputs, setShowContentInputs] = useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // New announcement form
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    message: "",
  });

  // Approval process state
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PurchaseRequest | null>(null);
  const [approvalForm, setApprovalForm] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    plan: "basic" as "basic" | "advanced" | "premium",
  });

  // User details state
  const [expandedUsers, setExpandedUsers] = useState<Set<number>>(new Set());
  const [passwordChangeDialog, setPasswordChangeDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");
  
  // Real-time user activity tracking
  const { isUserActive, getUserLastSeen } = useUserActivity();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  // Calculate submenu position based on available space
  const calculateSubmenuPosition = (category: string) => {
    if (!menuRef.current || !category) return 'right';
    
    const rect = menuRef.current.getBoundingClientRect();
    const screenWidth = window.innerWidth;
    const spaceOnRight = screenWidth - rect.right;
    const spaceOnLeft = rect.left;
    const submenuWidth = 280; // w-64 = 16rem = 256px + margins
    
    // If there's more space on the left and the right space is insufficient
    if (spaceOnLeft > submenuWidth && spaceOnRight < submenuWidth) {
      return 'left';
    }
    
    return 'right';
  };

  // Close menu dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuDropdownOpen && !(event.target as Element).closest('.menu-dropdown-container')) {
        setMenuDropdownOpen(false);
      }
    };

    if (menuDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [menuDropdownOpen]);

  const checkAdminAccess = async () => {
    console.log('Checking admin access...');
    const response = await apiClient.getCurrentUser();
    console.log('getCurrentUser response:', response);
    
    if (!response.data) {
      console.error('Failed to get current user:', response.error);
      toast({
        title: "Authentication Error",
        description: response.error || "Failed to authenticate user",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (!response.data.user.roles.includes('ROLE_ADMIN')) {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges.",
        variant: "destructive",
      });
      navigate("/learn");
      return;
    }

    setIsAdmin(true);
    loadData();
    setLoading(false);
  };

  const loadData = async () => {
    const [requestsResponse, usersResponse, contentResponse, announcementsResponse, bookingsResponse] = await Promise.all([
      apiClient.getPurchaseRequests(),
      apiClient.getUsers(),
      apiClient.getContent(),
      apiClient.getAnnouncements(),
      apiClient.getMentorshipBookings(),
    ]);

    if (requestsResponse.data) setRequests(requestsResponse.data.requests);
    if (usersResponse.data) setProfiles(usersResponse.data.users);
    if (contentResponse.data) setContent(contentResponse.data.content);
    if (announcementsResponse.data) setAnnouncements(announcementsResponse.data.announcements);
    if (bookingsResponse.data) setBookings(bookingsResponse.data.bookings);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await apiClient.createUser({
        email: newUser.email,
        password: newUser.password,
        name: newUser.name,
        phone: newUser.phone,
        plan: newUser.plan,
        roles: ['ROLE_USER'],
      });

      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "User account created successfully!",
      });

      setNewUser({
        email: "",
        password: "",
        name: "",
        phone: "",
        plan: "basic",
      });

      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Get available menu categories based on selected plan
  const getAvailableMenuCategories = (plan: string) => {
    if (!plan) return {};
    
    const categories: Record<string, Array<{value: string, label: string}>> = {};
    
    // Course Content - Available for all plans
    categories["Course Content"] = [{ value: "chapitre-1", label: "Chapitre I" }];
    
    if (plan === "advanced" || plan === "premium") {
      categories["Course Content"].push({ value: "chapitre-2", label: "Chapitre II" });
    }
    
    if (plan === "premium") {
      categories["Course Content"].push({ value: "chapitre-3", label: "Chapitre III" });
      categories["Course Content"].push({ value: "chapitre-4", label: "Chapitre IV" });
      
      categories["Strategies"] = [
        { value: "strategy-1", label: "Scalping Strategy" },
        { value: "strategy-2", label: "Swing Trading Model" },
        { value: "strategy-3", label: "Entry Models" },
      ];
      
      categories["VIP Community Access"] = [
        { value: "vip-1", label: "VIP Events" },
        { value: "vip-telegram", label: "VIP Telegram Link" },
        { value: "vip-discord", label: "VIP Discord Link" },
      ];
    }
    
    // Community Access - for all plans
    categories["Community Access"] = [
      { value: "community-telegram", label: "Telegram Group" },
      { value: "community-discord", label: "Discord Server" },
    ];
    
    return categories;
  };

  // Determine content type based on selected menu
  const getContentType = (menu: string): 'post' | 'link' => {
    // Chapters are posts
    if (menu.startsWith('chapitre-')) return 'post';
    // Strategies are posts
    if (menu.startsWith('strategy-')) return 'post';
    // VIP events are posts
    if (menu.startsWith('vip-')) return 'post';
    // Community links
    if (menu === 'community-telegram' || menu === 'community-discord') return 'link';
    // VIP links
    if (menu === 'vip-telegram' || menu === 'vip-discord') return 'link';
    // Default to post
    return 'post';
  };

  // Determine chapter, menu, and submenu based on selection
  const getLocationData = () => {
    if (selectedMenu.startsWith('chapitre-')) {
      return {
        chapter: selectedMenu,
        menu: null,
        submenu: null,
      };
    }
    if (selectedMenu.startsWith('strategy-')) {
      return {
        chapter: null,
        menu: 'strategies',
        submenu: selectedMenu,
      };
    }
    if (selectedMenu === 'vip-1') {
      // VIP Events are posts
      return {
        chapter: null,
        menu: 'vip',
        submenu: 'vip-1',
      };
    }
    // Community and VIP links
    if (selectedMenu.startsWith('community-') || selectedMenu.startsWith('vip-')) {
      return {
        chapter: null,
        menu: selectedMenu,
        submenu: null,
      };
    }
    return {
      chapter: null,
      menu: selectedMenu,
      submenu: null,
    };
  };

  // File upload handler
  const handleFileUpload = async (file: File, type: 'video' | 'pdf' | 'doc' | 'image') => {
    const setters = {
      video: setUploadingVideo,
      pdf: setUploadingPdf,
      doc: setUploadingDoc,
      image: setUploadingImage,
    };

    setters[type](true);

    try {
      const response = await apiClient.uploadFile(file);

      if (response.error) {
        toast({
          title: "Upload Error",
          description: response.error,
          variant: "destructive",
        });
        return;
      }

      if (response.data?.url) {
        switch (type) {
          case 'video':
            setNewPost({ ...newPost, videoUrl: response.data.url });
            break;
          case 'pdf':
            setNewPost({ ...newPost, pdfUrl: response.data.url });
            break;
          case 'doc':
            setNewPost({ ...newPost, docUrl: response.data.url });
            break;
          case 'image':
            setNewPost({ ...newPost, imageUrl: response.data.url });
            break;
        }

        toast({
          title: "Upload Successful",
          description: `${type.toUpperCase()} file uploaded successfully!`,
        });
      }
    } catch (error) {
      toast({
        title: "Upload Error",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setters[type](false);
    }
  };

  const handleCreateContent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const contentType = getContentType(selectedMenu);
      
      if (contentType === 'post') {
        // Create a post
        const locationData = getLocationData();
        
        const response = await apiClient.createPost({
          title: newPost.title,
          description: newPost.description,
          videoUrl: newPost.videoUrl || undefined,
          pdfUrl: newPost.pdfUrl || undefined,
          docUrl: newPost.docUrl || undefined,
          imageUrl: newPost.imageUrl || undefined,
          chapter: locationData.chapter || undefined,
          menu: locationData.menu || undefined,
          submenu: locationData.submenu || undefined,
          orderIndex: newPost.orderIndex || 0,
        });

        if (response.error) {
          toast({
            title: "Error",
            description: response.error,
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Success",
          description: "Post created successfully!",
        });

        setNewPost({
          title: "",
          description: "",
          videoUrl: "",
          pdfUrl: "",
          docUrl: "",
          imageUrl: "",
          orderIndex: 0,
        });
        setUploadingVideo(false);
        setUploadingPdf(false);
        setUploadingDoc(false);
        setUploadingImage(false);
      } else {
        // Create a link as Content entry
        if (!linkUrl) {
          toast({
            title: "Error",
            description: "Link URL is required",
            variant: "destructive",
          });
          return;
        }

        const locationData = getLocationData();
        const linkTitle = selectedMenu.includes('telegram') 
          ? 'Telegram Group' 
          : selectedMenu.includes('discord') 
          ? 'Discord Server'
          : 'Community Link';

        const response = await apiClient.createContent({
          title: linkTitle,
          description: `Link for ${selectedMenu}`,
          contentType: 'link',
          linkUrl: linkUrl,
          allowedPlans: selectedPlan,
        });

        if (response.error) {
          toast({
            title: "Error",
            description: response.error,
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Success",
          description: "Link created successfully!",
        });

        setLinkUrl("");
      }

      setSelectedPlan("");
      setSelectedMenu("");
      setShowContentInputs(false);
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdateRequestStatus = async (id: number, status: "pending" | "approved" | "rejected") => {
    try {
      const response = await apiClient.updatePurchaseRequestStatus(id, status);

      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: `Request marked as ${status}`,
      });

      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleApproveRequest = (request: PurchaseRequest) => {
    setSelectedRequest(request);
    setApprovalForm({
      email: request.email,
      password: "",
      name: request.name,
      phone: request.phone,
      plan: request.selectedPlan as "basic" | "advanced" | "premium",
    });
    setApprovalDialogOpen(true);
  };

  const handleCreateAccountFromRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRequest) return;

    try {
      // Create the user account
      const response = await apiClient.createUser({
        email: approvalForm.email,
        password: approvalForm.password,
        name: approvalForm.name,
        phone: approvalForm.phone,
        plan: approvalForm.plan,
        roles: ['ROLE_USER'],
      });

      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        });
        return;
      }

      // Delete the request after successful account creation
      await apiClient.deletePurchaseRequest(selectedRequest.id);

      toast({
        title: "Success",
        description: "User account created successfully and request removed!",
      });

      setApprovalDialogOpen(false);
      setSelectedRequest(null);
      setApprovalForm({
        email: "",
        password: "",
        name: "",
        phone: "",
        plan: "basic",
      });

      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleUserExpansion = (userId: number) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedUsers(newExpanded);
  };

  const handlePasswordChange = (user: User) => {
    setSelectedUser(user);
    setNewPassword("");
    setPasswordChangeDialog(true);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser) return;

    try {
      const response = await apiClient.updateUserPassword(selectedUser.id, newPassword);

      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Password updated successfully!",
      });

      setPasswordChangeDialog(false);
      setSelectedUser(null);
      setNewPassword("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await apiClient.logout();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <img src={logo} alt="Loading" className="h-20 w-20 mx-auto animate-pulse mb-4" />
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-4 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="h-10 w-10" />
            <div>
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Trade Academy</p>
            </div>
          </div>
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList className="grid w-full md:w-auto grid-cols-4 md:grid-cols-5">
            <TabsTrigger value="requests">
              <FileText className="h-4 w-4 mr-2" />
              Requests
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="create-user">
              <UserPlus className="h-4 w-4 mr-2" />
              New User
            </TabsTrigger>
            <TabsTrigger value="content">
              <FileText className="h-4 w-4 mr-2" />
              Content
            </TabsTrigger>
            <TabsTrigger value="bookings">
              <Calendar className="h-4 w-4 mr-2" />
              Bookings
            </TabsTrigger>
          </TabsList>

          {/* Access Requests */}
          <TabsContent value="requests" className="space-y-4">
            <h2 className="text-2xl font-bold">Access Requests</h2>
            {requests.length === 0 ? (
              <Card className="p-8 text-center bg-card">
                <p className="text-muted-foreground">No access requests yet</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {requests.map((request) => (
                  <Card key={request.id} className="p-6 bg-card">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-lg">{request.name}</h3>
                        <p className="text-sm text-muted-foreground">{request.email}</p>
                        <p className="text-sm text-muted-foreground">{request.phone}</p>
                        <p className="text-sm mt-2">
                          <span className="font-semibold">Plan:</span>{" "}
                          <span className="capitalize">{request.selectedPlan}</span>
                        </p>
                        {request.message && (
                          <p className="text-sm mt-2 text-muted-foreground">{request.message}</p>
                        )}
                        <p className="text-xs mt-2">
                          <span className="font-semibold">Status:</span>{" "}
                          <span className={`capitalize ${
                            request.status === "approved" ? "text-green-500" :
                            request.status === "rejected" ? "text-red-500" : ""
                          }`}>
                            {request.status}
                          </span>
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApproveRequest(request)}
                          disabled={request.status === "approved"}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleUpdateRequestStatus(request.id, "rejected")}
                          disabled={request.status === "rejected"}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Users */}
          <TabsContent value="users" className="space-y-4">
            <h2 className="text-2xl font-bold">All Users</h2>
            {profiles.length === 0 ? (
              <Card className="p-8 text-center bg-card">
                <p className="text-muted-foreground">No users yet</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {profiles.map((profile) => (
                  <Card key={profile.id} className="p-6 bg-card">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg">{profile.name}</h3>
                          <span className={`capitalize inline-flex items-center gap-1 text-sm ${
                            isUserActive(profile.id) ? "text-green-500" : "text-gray-500"
                          }`}>
                            <div className={`w-2 h-2 rounded-full ${
                              isUserActive(profile.id) ? "bg-green-500" : "bg-gray-400"
                            }`}></div>
                            {isUserActive(profile.id) ? "Active" : "Offline"}
                          </span>
                        </div>
                        <p className="text-sm mt-2">
                          <span className="font-semibold">Plan:</span>{" "}
                          <span className="capitalize">{profile.plan}</span>
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white border-0"
                          onClick={() => toggleUserExpansion(profile.id)}
                        >
                          {expandedUsers.has(profile.id) ? (
                            <ChevronDown className="h-4 w-4 mr-1" />
                          ) : (
                            <ChevronRight className="h-4 w-4 mr-1" />
                          )}
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white border-0"
                          onClick={() => handlePasswordChange(profile)}
                        >
                          <Key className="h-4 w-4 mr-1" />
                          Change Password
                        </Button>
                      </div>
                    </div>
                    
                    <Collapsible open={expandedUsers.has(profile.id)}>
                      <CollapsibleContent className="mt-4 space-y-2">
                        <div className="border-t pt-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm">
                                <span className="font-semibold">Phone:</span>{" "}
                                <span className="text-muted-foreground">
                                  {profile.phone || "Not provided"}
                                </span>
                              </p>
                              <p className="text-sm">
                                <span className="font-semibold">Email:</span>{" "}
                                <span className="text-muted-foreground">
                                  {profile.email}
                                </span>
                              </p>
                              <p className="text-sm">
                                <span className="font-semibold">Created:</span>{" "}
                                <span className="text-muted-foreground">
                                  {new Date(profile.createdAt).toLocaleDateString()}
                                </span>
                              </p>
                            </div>
                            <div>
                              {!isUserActive(profile.id) && getUserLastSeen(profile.id) && (
                                <p className="text-sm text-muted-foreground">
                                  <span className="font-semibold">Last seen:</span> {getUserLastSeen(profile.id)}
                                </p>
                              )}
                            </div>
                          </div>
                          {profile.progress && (
                            <div className="mt-4">
                              <p className="text-sm font-semibold mb-2">Progress:</p>
                              <div className="bg-muted p-3 rounded-md">
                                <pre className="text-xs text-muted-foreground">
                                  {JSON.stringify(profile.progress, null, 2)}
                                </pre>
                              </div>
                            </div>
                          )}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Create User */}
          <TabsContent value="create-user">
            <Card className="p-6 bg-card">
              <h2 className="text-2xl font-bold mb-6">Create New User</h2>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-email">Email *</Label>
                  <Input
                    id="new-email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Password *</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-name">Full Name *</Label>
                  <Input
                    id="new-name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-phone">Phone</Label>
                  <Input
                    id="new-phone"
                    type="tel"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-plan">Plan *</Label>
                  <Select
                    value={newUser.plan}
                    onValueChange={(value: "basic" | "advanced" | "premium") => setNewUser({ ...newUser, plan: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
                  Create User
                </Button>
              </form>
            </Card>
          </TabsContent>

          {/* Content Management */}
          <TabsContent value="content" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Create New Content</h2>
              <Card className="p-6 bg-card">
                <form onSubmit={handleCreateContent} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="content-location-plan">Choose Plan *</Label>
                      <Select
                        value={selectedPlan}
                        onValueChange={(value) => {
                          setSelectedPlan(value);
                          setSelectedMenu(""); // Reset menu selection when plan changes
                          setShowContentInputs(false); // Reset content inputs
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a plan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basic">Basic</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="content-location-menu">Choose Menu *</Label>
                      <div className="relative menu-dropdown-container">
                        <div
                          onClick={() => selectedPlan && setMenuDropdownOpen(!menuDropdownOpen)}
                          className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${!selectedPlan ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <span className="text-muted-foreground">
                            {selectedMenu 
                              ? (() => {
                                  const categories = getAvailableMenuCategories(selectedPlan);
                                  for (const [cat, items] of Object.entries(categories)) {
                                    const item = items.find(item => item.value === selectedMenu);
                                    if (item) {
                                      return `${cat} > ${item.label}`;
                                    }
                                  }
                                  return "Select a menu";
                                })()
                              : "Select a menu"
                            }
                          </span>
                          <ChevronDown className="h-4 w-4 opacity-50" />
                    </div>
                        
                        {menuDropdownOpen && selectedPlan && (
                          <div className="relative" style={{ overflow: 'visible' }} ref={menuRef}>
                            <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md" style={{ overflow: 'visible' }}>
                              <div className="max-h-[300px] overflow-y-auto p-1" style={{ overflowX: 'visible' }}>
                                {Object.entries(getAvailableMenuCategories(selectedPlan)).map(([category, items], index) => (
                                  <div
                                    key={category}
                                    className="relative"
                                    onMouseEnter={(e) => {
                                      setHoveredCategory(category);
                                      setHoveredItemElement(e.currentTarget);
                                      setSubmenuPosition(calculateSubmenuPosition(category));
                                    }}
                                    onMouseLeave={() => {
                                      setHoveredCategory("");
                                      setHoveredItemElement(null);
                                    }}
                                  >
                                    <div className="group relative flex w-full cursor-pointer items-center justify-between rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground">
                                      <span>{category}</span>
                                      <span className="ml-2">&gt;</span>
                  </div>
                                    
                                    {/* Submenu on hover - positioned outside the dropdown container */}
                                    {hoveredCategory === category && items.length > 0 && (() => {
                                      const position = calculateSubmenuPosition(category);
                                      const isLeft = position === 'left';
                                      const itemRect = hoveredItemElement?.getBoundingClientRect();
                                      
                                      return (
                                        <div 
                                          className="fixed z-[60] w-64 rounded-md border bg-popover shadow-lg"
                                          style={{
                                            top: `${itemRect?.top || 0}px`,
                                            left: isLeft 
                                              ? `${(itemRect?.left || 0) - 256}px`
                                              : `${(itemRect?.right || 0) + 0}px`,
                                            height: 'auto',
                                            maxHeight: `${window.innerHeight - (itemRect?.top || 0) - 16}px`
                                          }}
                                        >
                                          <div className="p-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 120px)' }}>
                                            {items.map((item) => (
                                              <div
                                                key={item.value}
                                                onClick={() => {
                                                  setSelectedMenu(item.value);
                                                  setMenuDropdownOpen(false);
                                                  setHoveredCategory("");
                                                  setShowContentInputs(false);
                                                }}
                                                className="cursor-pointer rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                                              >
                                                {item.label}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      );
                                    })()}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {selectedPlan && selectedMenu ? (
                    <div className="p-4 bg-muted rounded-md">
                      <p className="text-sm font-medium">Selected Location:</p>
                      <p className="text-sm text-muted-foreground">
                        Plan: <span className="capitalize font-medium">{selectedPlan}</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Menu: <span className="font-medium">{(() => {
                          const categories = getAvailableMenuCategories(selectedPlan);
                          for (const [cat, items] of Object.entries(categories)) {
                            const item = items.find(item => item.value === selectedMenu);
                            if (item) {
                              return `${cat} > ${item.label}`;
                            }
                          }
                          return selectedMenu;
                        })()}</span>
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 bg-muted rounded-md">
                      <p className="text-sm text-muted-foreground">Please select a plan and menu to continue.</p>
                    </div>
                  )}
                  
                  {/* Content Inputs Section */}
                  {showContentInputs && selectedPlan && selectedMenu && (
                    <div className="mt-6 pt-6 border-t border-border space-y-4">
                      <h3 className="text-lg font-semibold">Add Content</h3>
                      
                      {(() => {
                        const contentType = getContentType(selectedMenu);
                        
                        if (contentType === 'post') {
                          // Post inputs for chapters, strategies, and VIP events
                          return (
                            <>
                              <div className="space-y-2">
                                <Label htmlFor="post-title">Title *</Label>
                                <Input
                                  id="post-title"
                                  value={newPost.title}
                                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                                  required
                                  placeholder="Enter post title"
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="post-description">Description</Label>
                                <Textarea
                                  id="post-description"
                                  value={newPost.description}
                                  onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
                                  placeholder="Enter post description"
                                  rows={4}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="post-video">Video URL (YouTube embed)</Label>
                                <div className="flex gap-2">
                                  <Input
                                    id="post-video"
                                    type="url"
                                    value={newPost.videoUrl}
                                    onChange={(e) => setNewPost({ ...newPost, videoUrl: e.target.value })}
                                    placeholder="https://www.youtube.com/embed/..."
                                    className="flex-1"
                                  />
                                  <input
                                    type="file"
                                    accept="video/*"
                                    id="video-upload"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleFileUpload(file, 'video');
                                    }}
                                  />
                                  <label htmlFor="video-upload">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      disabled={uploadingVideo}
                                      className="cursor-pointer"
                                    >
                                      {uploadingVideo ? 'Uploading...' : <Upload className="h-4 w-4" />}
                                    </Button>
                                  </label>
                                </div>
                              </div>
                              
                              <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="post-pdf">PDF File URL</Label>
                                  <div className="flex gap-2">
                                    <Input
                                      id="post-pdf"
                                      type="url"
                                      value={newPost.pdfUrl}
                                      onChange={(e) => setNewPost({ ...newPost, pdfUrl: e.target.value })}
                                      placeholder="https://example.com/file.pdf"
                                      className="flex-1"
                                    />
                                    <input
                                      type="file"
                                      accept=".pdf"
                                      id="pdf-upload"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleFileUpload(file, 'pdf');
                                      }}
                                    />
                                    <label htmlFor="pdf-upload">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        disabled={uploadingPdf}
                                        className="cursor-pointer"
                                      >
                                        {uploadingPdf ? 'Uploading...' : <Upload className="h-4 w-4" />}
                                      </Button>
                                    </label>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="post-doc">DOC File URL</Label>
                                  <div className="flex gap-2">
                                    <Input
                                      id="post-doc"
                                      type="url"
                                      value={newPost.docUrl}
                                      onChange={(e) => setNewPost({ ...newPost, docUrl: e.target.value })}
                                      placeholder="https://example.com/file.doc"
                                      className="flex-1"
                                    />
                                    <input
                                      type="file"
                                      accept=".doc,.docx"
                                      id="doc-upload"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleFileUpload(file, 'doc');
                                      }}
                                    />
                                    <label htmlFor="doc-upload">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        disabled={uploadingDoc}
                                        className="cursor-pointer"
                                      >
                                        {uploadingDoc ? 'Uploading...' : <Upload className="h-4 w-4" />}
                                      </Button>
                                    </label>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="post-image">Image URL</Label>
                                <div className="flex gap-2">
                                  <Input
                                    id="post-image"
                                    type="url"
                                    value={newPost.imageUrl}
                                    onChange={(e) => setNewPost({ ...newPost, imageUrl: e.target.value })}
                                    placeholder="https://example.com/image.jpg"
                                    className="flex-1"
                                  />
                                  <input
                                    type="file"
                                    accept="image/*"
                                    id="image-upload"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleFileUpload(file, 'image');
                                    }}
                                  />
                                  <label htmlFor="image-upload">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      disabled={uploadingImage}
                                      className="cursor-pointer"
                                    >
                                      {uploadingImage ? 'Uploading...' : <Upload className="h-4 w-4" />}
                                    </Button>
                                  </label>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="post-order">Order Index</Label>
                                <Input
                                  id="post-order"
                                  type="number"
                                  value={newPost.orderIndex}
                                  onChange={(e) => setNewPost({ ...newPost, orderIndex: parseInt(e.target.value) || 0 })}
                                  min={0}
                                />
                              </div>
                            </>
                          );
                        } else {
                          // Link inputs for community and VIP links
                          return (
                            <div className="space-y-2">
                              <Label htmlFor="link-url">Link URL *</Label>
                              <Input
                                id="link-url"
                                type="url"
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                placeholder="https://t.me/your-group"
                                required
                              />
                              <p className="text-xs text-muted-foreground">
                                Update the {selectedMenu} link
                              </p>
                            </div>
                          );
                        }
                      })()}
                      
                      <div className="flex justify-end gap-2 mt-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowContentInputs(false);
                            setNewPost({
                              title: "",
                              description: "",
                              videoUrl: "",
                              pdfUrl: "",
                              docUrl: "",
                              imageUrl: "",
                              orderIndex: 0,
                            });
                            setLinkUrl("");
                            setUploadingVideo(false);
                            setUploadingPdf(false);
                            setUploadingDoc(false);
                            setUploadingImage(false);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white border-0 shadow-md px-6"
                        >
                          Create {getContentType(selectedMenu) === 'post' ? 'Post' : 'Link'}
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Continue Button */}
                  {selectedPlan && selectedMenu && !showContentInputs && (
                    <div className="flex justify-end mt-6">
                      <Button
                        type="button"
                        className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white border-0 shadow-md px-6"
                        onClick={() => setShowContentInputs(true)}
                      >
                        Continue
                      </Button>
                    </div>
                  )}
                </form>
              </Card>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">Existing Content</h2>
              {content.length === 0 ? (
                <Card className="p-8 text-center bg-card">
                  <p className="text-muted-foreground">No content created yet</p>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {content.map((item) => (
                    <Card key={item.id} className="p-6 bg-card">
                      <h3 className="font-bold text-lg">{item.title}</h3>
                      {item.description && (
                        <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                      )}
                      <p className="text-sm mt-2">
                        <span className="font-semibold">Allowed Plans:</span>{" "}
                        <span className="capitalize">{item.allowedPlans}</span>
                      </p>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Booked Sessions */}
          <TabsContent value="bookings" className="space-y-4">
            <h2 className="text-2xl font-bold">Mentorship Bookings</h2>
            {bookings.length === 0 ? (
              <Card className="p-8 text-center bg-card">
                <p className="text-muted-foreground">No mentorship bookings yet</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {bookings.map((booking) => (
                  <Card key={booking.id} className="p-6 bg-card">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-lg">{booking.userName}</h3>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            booking.status === 'approved' ? 'bg-green-500/20 text-green-500' :
                            booking.status === 'rejected' ? 'bg-red-500/20 text-red-500' :
                            booking.status === 'completed' ? 'bg-blue-500/20 text-blue-500' :
                            'bg-yellow-500/20 text-yellow-500'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          <strong>Email:</strong> {booking.userEmail}
                        </p>
                        <p className="text-sm text-muted-foreground mb-2">
                          <strong>Date:</strong> {booking.bookingDate} at {booking.bookingTime}
                        </p>
                        <p className="text-sm text-muted-foreground mb-2">
                          <strong>Duration:</strong> {booking.duration} minutes
                        </p>
                        {booking.message && (
                          <p className="text-sm text-muted-foreground mt-2">
                            <strong>Message:</strong> {booking.message}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          Created: {booking.createdAt}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          size="sm"
                          onClick={async () => {
                            await apiClient.updateMentorshipBookingStatus(booking.id, 'approved');
                            toast({ title: "Success", description: "Booking approved" });
                            loadData();
                          }}
                          disabled={booking.status === 'approved'}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={async () => {
                            await apiClient.updateMentorshipBookingStatus(booking.id, 'rejected');
                            toast({ title: "Success", description: "Booking rejected" });
                            loadData();
                          }}
                          disabled={booking.status === 'rejected'}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Approval Dialog */}
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Account for {selectedRequest?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateAccountFromRequest} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="approval-email">Email *</Label>
                <Input
                  id="approval-email"
                  type="email"
                  value={approvalForm.email}
                  onChange={(e) => setApprovalForm({ ...approvalForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="approval-password">Password *</Label>
                <Input
                  id="approval-password"
                  type="password"
                  value={approvalForm.password}
                  onChange={(e) => setApprovalForm({ ...approvalForm, password: e.target.value })}
                  required
                  minLength={6}
                  placeholder="Set password for user"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="approval-name">Full Name *</Label>
                <Input
                  id="approval-name"
                  value={approvalForm.name}
                  onChange={(e) => setApprovalForm({ ...approvalForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="approval-phone">Phone</Label>
                <Input
                  id="approval-phone"
                  type="tel"
                  value={approvalForm.phone}
                  onChange={(e) => setApprovalForm({ ...approvalForm, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="approval-plan">Plan *</Label>
              <Select
                value={approvalForm.plan}
                onValueChange={(value: "basic" | "advanced" | "premium") => 
                  setApprovalForm({ ...approvalForm, plan: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setApprovalDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
                Create Account
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Password Change Dialog */}
      <Dialog open={passwordChangeDialog} onOpenChange={setPasswordChangeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password for {selectedUser?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password *</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Enter new password"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPasswordChangeDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
                Update Password
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
