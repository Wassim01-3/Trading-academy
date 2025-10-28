import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient, User, Post } from "@/integrations/api/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useUserActivity } from "@/hooks/use-user-activity";
import { BookOpen, LogOut, MessageCircle, Users, Lock, Target, UserCheck, Crown } from "lucide-react";
import { PostDisplay } from "@/components/ui/post-display";
import { MentorshipBooking } from "@/components/ui/mentorship-booking";
import logo from "@/assets/logo.png";

interface Profile {
  name: string;
  plan: string;
}

const Learn = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [selectedMenu, setSelectedMenu] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useUserActivity();

  useEffect(() => {
    const checkAuth = async () => {
      const response = await apiClient.getCurrentUser();
      
      if (!response.data) {
        navigate("/login");
        return;
      }

      setUser(response.data.user);
      setProfile({
        name: response.data.user.name,
        plan: response.data.user.plan
      });

      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  // Fetch posts when chapter or menu changes
  useEffect(() => {
    const fetchPosts = async () => {
      if (!selectedChapter && !selectedMenu) {
        setPosts([]);
        return;
      }

      try {
        let response;
        if (selectedChapter) {
          response = await apiClient.getPosts({ chapter: selectedChapter });
        } else if (selectedMenu) {
          // For strategies and vip menus, treat as submenu
          if (selectedMenu.startsWith('strategy-') || selectedMenu.startsWith('vip-')) {
            response = await apiClient.getPosts({ submenu: selectedMenu });
          } else {
            response = await apiClient.getPosts({ menu: selectedMenu });
          }
        }

        if (response?.data) {
          setPosts(response.data.posts || []);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts();
  }, [selectedChapter, selectedMenu]);

  const handleLogout = async () => {
    await apiClient.logout();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <img src={logo} alt="Loading" className="h-20 w-20 mx-auto animate-pulse mb-4" />
          <p className="text-muted-foreground">Loading your courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-4 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="h-10 w-10" />
            <div>
              <h1 className="text-xl font-bold">Trade Academy</h1>
              {profile && (
                <p className="text-sm text-muted-foreground">
                  Welcome, {profile.name} ({profile.plan})
                </p>
              )}
            </div>
          </div>
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <Card className="p-4 bg-card border-border">
              <h2 className="font-bold mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Course Content
              </h2>
              <div className="space-y-2">
                {['chapitre-1', 'chapitre-2', 'chapitre-3', 'chapitre-4'].map((chapter, idx) => {
                  const chapterNum = idx + 1;
                  const isLocked = (profile?.plan === 'basic' && chapterNum > 1) || 
                                  (profile?.plan === 'advanced' && chapterNum > 2);
                  
                  return (
                    <button
                      key={chapter}
                      onClick={() => {
                        setSelectedChapter(chapter);
                        setSelectedMenu(null);
                      }}
                      className={`w-full text-left px-3 py-2 rounded transition-colors flex items-center gap-2 ${
                        selectedChapter === chapter
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      {isLocked ? (
                        <Lock className="h-4 w-4 text-yellow-500" />
                      ) : (
                        <BookOpen className="h-4 w-4 text-yellow-500" />
                      )}
                      <div>
                        <div className="text-sm font-medium">Chapitre {chapterNum}</div>
                        <div className="text-xs opacity-80">
                          {isLocked ? 'Locked' : 'Available'}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Community Access */}
            <Card className="p-4 bg-card border-border mt-4">
              <h2 className="font-bold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Community Access
              </h2>
              <div className="space-y-2">
                <a
                  href="https://t.me/+FGtFohk4OTs1OGRk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-left px-3 py-2 rounded transition-colors hover:bg-muted flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4 text-blue-500" />
                  <div>
                    <div className="text-sm font-medium">Telegram Group</div>
                    <div className="text-xs opacity-80">Join our community</div>
                  </div>
                </a>
                <a
                  href="https://discord.gg/your-trading-academy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-left px-3 py-2 rounded transition-colors hover:bg-muted flex items-center gap-2"
                >
                  <Users className="h-4 w-4 text-indigo-500" />
                  <div>
                    <div className="text-sm font-medium">Discord Server</div>
                    <div className="text-xs opacity-80">Connect with traders</div>
                  </div>
                </a>
              </div>
            </Card>

            {/* Strategies Menu - Premium only */}
            {profile?.plan === 'premium' && (
              <Card className="p-4 bg-card border-border mt-4">
                <h2 className="font-bold mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Strategies
                </h2>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setSelectedMenu('strategy-1');
                      setSelectedChapter(null);
                    }}
                    className={`w-full text-left px-3 py-2 rounded transition-colors flex items-center gap-2 ${
                      selectedMenu === 'strategy-1'
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    <Target className="h-4 w-4 text-yellow-500" />
                    <div className="text-sm font-medium">Scalping Strategy</div>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedMenu('strategy-2');
                      setSelectedChapter(null);
                    }}
                    className={`w-full text-left px-3 py-2 rounded transition-colors flex items-center gap-2 ${
                      selectedMenu === 'strategy-2'
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    <Target className="h-4 w-4 text-yellow-500" />
                    <div className="text-sm font-medium">Swing Trading Model</div>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedMenu('strategy-3');
                      setSelectedChapter(null);
                    }}
                    className={`w-full text-left px-3 py-2 rounded transition-colors flex items-center gap-2 ${
                      selectedMenu === 'strategy-3'
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    <Target className="h-4 w-4 text-yellow-500" />
                    <div className="text-sm font-medium">Entry Models</div>
                  </button>
                </div>
              </Card>
            )}

            {/* 1-on-1 Mentorship - Premium only */}
            {profile?.plan === 'premium' && (
              <Card className="p-4 bg-card border-border mt-4">
                <h2 className="font-bold mb-4 flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-primary" />
                  1-on-1 Mentorship
                </h2>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setSelectedMenu('mentorship-1');
                      setSelectedChapter(null);
                    }}
                    className={`w-full text-left px-3 py-2 rounded transition-colors flex items-center gap-2 ${
                      selectedMenu === 'mentorship-1'
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    <UserCheck className="h-4 w-4 text-yellow-500" />
                    <div className="text-sm font-medium">Book Session</div>
                  </button>
                </div>
              </Card>
            )}

            {/* VIP Community - Premium only */}
            {profile?.plan === 'premium' && (
              <Card className="p-4 bg-card border-border mt-4">
                <h2 className="font-bold mb-4 flex items-center gap-2">
                  <Crown className="h-5 w-5 text-primary" />
                  VIP Community
                </h2>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setSelectedMenu('vip-1');
                      setSelectedChapter(null);
                    }}
                    className={`w-full text-left px-3 py-2 rounded transition-colors flex items-center gap-2 ${
                      selectedMenu === 'vip-1'
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    <Crown className="h-4 w-4 text-yellow-500" />
                    <div className="text-sm font-medium">VIP Events</div>
                  </button>
                </div>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            {selectedMenu === 'mentorship-1' && profile?.plan === 'premium' ? (
              <MentorshipBooking userPlan={profile?.plan || ''} />
            ) : selectedChapter || selectedMenu ? (
              <PostDisplay posts={posts} />
            ) : (
              <Card className="p-12 bg-card border-border text-center">
                <BookOpen className="h-16 w-16 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">No Content Selected</h2>
                <p className="text-muted-foreground">
                  Select a chapter or course from the sidebar to start learning
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Learn;

