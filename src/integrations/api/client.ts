// API client for Symfony backend
const API_BASE_URL = 'http://localhost:8000/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

interface User {
  id: number;
  email: string;
  name: string;
  plan: string;
  phone?: string;
  roles: string[];
  progress?: any;
  isActive: boolean;
  createdAt: string;
}

interface PurchaseRequest {
  id: number;
  name: string;
  email: string;
  phone: string;
  selectedPlan: string;
  status: string;
  message?: string;
  createdAt: string;
  updatedAt: string;
}

interface Content {
  id: number;
  title: string;
  description?: string;
  fileUrl?: string;
  videoUrl?: string;
  allowedPlans: string;
  contentType?: string;
  linkUrl?: string;
  createdAt: string;
}

interface Announcement {
  id: number;
  title: string;
  message: string;
  createdAt: string;
}

interface Post {
  id: number;
  title: string;
  description?: string;
  videoUrl?: string;
  pdfUrl?: string;
  docUrl?: string;
  imageUrl?: string;
  chapter?: string;
  menu?: string;
  submenu?: string;
  orderIndex: number;
  createdAt: string;
}

interface MentorshipBooking {
  id: number;
  userId?: number;
  userName?: string;
  userEmail?: string;
  bookingDate: string;
  bookingTime: string;
  duration: number;
  status: string;
  message?: string;
  createdAt: string;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('auth_token');
    console.log('API Client initialized with token:', this.token);
  }

  // Method to refresh token from localStorage
  private refreshToken(): void {
    this.token = localStorage.getItem('auth_token');
    console.log('Token refreshed:', this.token);
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // Refresh token from localStorage before making request
    this.refreshToken();
    
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    console.log(`Making request to ${url} with headers:`, headers);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();
      console.log(`Response from ${url}:`, { status: response.status, data });

      if (!response.ok) {
        return { error: data.error || 'An error occurred' };
      }

      return { data };
    } catch (error) {
      console.error(`Network error for ${url}:`, error);
      return { error: 'Network error' };
    }
  }

  // Authentication methods
  async login(email: string, password: string): Promise<ApiResponse<{ user: User }>> {
    const response = await this.request<{ user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.data) {
      // Use email as token for the custom authenticator
      this.token = email;
      localStorage.setItem('auth_token', this.token);
      console.log('Token set after login:', this.token);
    }

    return response;
  }

  async register(userData: {
    email: string;
    password: string;
    name: string;
    plan: string;
    phone?: string;
  }): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout(): Promise<ApiResponse<{ message: string }>> {
    const response = await this.request<{ message: string }>('/auth/logout', {
      method: 'POST',
    });

    this.token = null;
    localStorage.removeItem('auth_token');

    return response;
  }

  async getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
    console.log('Getting current user, token:', this.token);
    return this.request<{ user: User }>('/auth/me');
  }

  // Purchase request methods
  async createPurchaseRequest(requestData: {
    name: string;
    email: string;
    phone: string;
    selectedPlan: string;
    message?: string;
  }): Promise<ApiResponse<{ request: PurchaseRequest }>> {
    return this.request<{ request: PurchaseRequest }>('/purchase-requests', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }

  async getPurchaseRequests(): Promise<ApiResponse<{ requests: PurchaseRequest[] }>> {
    return this.request<{ requests: PurchaseRequest[] }>('/purchase-requests');
  }

  async updatePurchaseRequestStatus(
    id: number,
    status: string
  ): Promise<ApiResponse<{ request: PurchaseRequest }>> {
    return this.request<{ request: PurchaseRequest }>(`/purchase-requests/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async deletePurchaseRequest(id: number): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/purchase-requests/${id}`, {
      method: 'DELETE',
    });
  }

  // Content methods
  async getContent(): Promise<ApiResponse<{ content: Content[] }>> {
    return this.request<{ content: Content[] }>('/content');
  }

  async getContentById(id: number): Promise<ApiResponse<{ content: Content }>> {
    return this.request<{ content: Content }>(`/content/${id}`);
  }

  async createContent(contentData: {
    title: string;
    description?: string;
    content_body?: string;
    video_url?: string;
    min_plan?: string;
    order_index?: number;
    contentType?: string;
    linkUrl?: string;
    allowedPlans?: string;
  }): Promise<ApiResponse<{ content: Content }>> {
    return this.request<{ content: Content }>('/content', {
      method: 'POST',
      body: JSON.stringify(contentData),
    });
  }

  async updateContent(
    id: number,
    contentData: Partial<Content>
  ): Promise<ApiResponse<{ content: Content }>> {
    return this.request<{ content: Content }>(`/content/${id}`, {
      method: 'PUT',
      body: JSON.stringify(contentData),
    });
  }

  async deleteContent(id: number): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/content/${id}`, {
      method: 'DELETE',
    });
  }

  // Announcement methods
  async getAnnouncements(): Promise<ApiResponse<{ announcements: Announcement[] }>> {
    return this.request<{ announcements: Announcement[] }>('/announcements');
  }

  async getAnnouncementById(id: number): Promise<ApiResponse<{ announcement: Announcement }>> {
    return this.request<{ announcement: Announcement }>(`/announcements/${id}`);
  }

  async createAnnouncement(announcementData: {
    title: string;
    message: string;
  }): Promise<ApiResponse<{ announcement: Announcement }>> {
    return this.request<{ announcement: Announcement }>('/announcements', {
      method: 'POST',
      body: JSON.stringify(announcementData),
    });
  }

  async updateAnnouncement(
    id: number,
    announcementData: Partial<Announcement>
  ): Promise<ApiResponse<{ announcement: Announcement }>> {
    return this.request<{ announcement: Announcement }>(`/announcements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(announcementData),
    });
  }

  async deleteAnnouncement(id: number): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/announcements/${id}`, {
      method: 'DELETE',
    });
  }

  // Admin methods
  async getAdminDashboard(): Promise<ApiResponse<{ stats: any }>> {
    return this.request<{ stats: any }>('/admin/dashboard');
  }

  async getUsers(): Promise<ApiResponse<{ users: User[] }>> {
    return this.request<{ users: User[] }>('/admin/users');
  }

  async createUser(userData: {
    email: string;
    password: string;
    name: string;
    plan: string;
    phone?: string;
    roles?: string[];
  }): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(
    id: number,
    userData: Partial<User>
  ): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async updateUserPassword(
    id: number,
    password: string
  ): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>(`/admin/users/${id}/password`, {
      method: 'PATCH',
      body: JSON.stringify({ password }),
    });
  }

  async deleteUser(id: number): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  }

  // User activity methods
  async sendHeartbeat(): Promise<ApiResponse<{ message: string; timestamp: number }>> {
    return this.request<{ message: string; timestamp: number }>('/user-activity/heartbeat', {
      method: 'POST',
    });
  }

  async getUserStatuses(): Promise<ApiResponse<{ userStatuses: Array<{ userId: number; isActive: boolean; lastSeen: number | null; lastSeenFormatted: string | null }>; timestamp: number }>> {
    return this.request<{ userStatuses: Array<{ userId: number; isActive: boolean; lastSeen: number | null; lastSeenFormatted: string | null }>; timestamp: number }>('/user-activity/status');
  }

  async logoutActivity(): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>('/user-activity/logout', {
      method: 'POST',
    });
  }

  // Post methods
  async getPosts(params?: { chapter?: string; menu?: string; submenu?: string }): Promise<ApiResponse<{ posts: Post[] }>> {
    const query = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.request<{ posts: Post[] }>(`/posts${query}`);
  }

  async createPost(postData: {
    title: string;
    description?: string;
    videoUrl?: string;
    pdfUrl?: string;
    docUrl?: string;
    imageUrl?: string;
    chapter?: string;
    menu?: string;
    submenu?: string;
    orderIndex?: number;
  }): Promise<ApiResponse<{ post: Post }>> {
    return this.request<{ post: Post }>('/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  async updatePost(id: number, postData: Partial<Post>): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(postData),
    });
  }

  async deletePost(id: number): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/posts/${id}`, {
      method: 'DELETE',
    });
  }

  // Mentorship booking methods
  async getMentorshipBookings(): Promise<ApiResponse<{ bookings: MentorshipBooking[] }>> {
    return this.request<{ bookings: MentorshipBooking[] }>('/mentorship-bookings');
  }

  async createMentorshipBooking(bookingData: {
    bookingDate: string;
    bookingTime: string;
    duration: number;
    message?: string;
  }): Promise<ApiResponse<{ booking: MentorshipBooking }>> {
    return this.request<{ booking: MentorshipBooking }>('/mentorship-bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async updateMentorshipBookingStatus(id: number, status: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/mentorship-bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async updateMentorshipBooking(id: number, bookingData: Partial<MentorshipBooking>): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/mentorship-bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bookingData),
    });
  }

  // File upload method
  async uploadFile(file: File): Promise<ApiResponse<{ url: string; public_id: string }>> {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('auth_token');
    
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Upload failed' };
    }

    return { data };
  }
}

export const apiClient = new ApiClient();
export type { User, PurchaseRequest, Content, Announcement, Post, MentorshipBooking, ApiResponse };