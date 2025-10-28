import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { apiClient } from "@/integrations/api/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      console.log('Login component checking session...');
      const response = await apiClient.getCurrentUser();
      console.log('Session check response:', response);
      
      if (response.data) {
        // Check if user is admin and redirect accordingly
        if (response.data.user.roles.includes('ROLE_ADMIN')) {
          console.log('User is admin, redirecting to /admin');
          navigate("/admin");
        } else {
          console.log('User is not admin, redirecting to /learn');
          navigate("/learn");
        }
      } else {
        // Clear invalid token if authentication fails
        if (response.error) {
          console.error('Session check failed:', response.error);
          localStorage.removeItem('auth_token');
        }
      }
    };
    checkSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = loginSchema.parse({ email, password });
      setIsLoading(true);

      const response = await apiClient.login(validatedData.email, validatedData.password);

      if (response.error) {
        toast({
          title: "Login Failed",
          description: response.error,
          variant: "destructive",
        });
        return;
      }

      if (response.data) {
        console.log('Login successful, user data:', response.data);
        toast({
          title: "Welcome back!",
          description: "You've successfully logged in.",
        });
        
        // Check if user is admin and redirect accordingly
        if (response.data.user.roles.includes('ROLE_ADMIN')) {
          console.log('User is admin, redirecting to /admin');
          navigate("/admin");
        } else {
          console.log('User is not admin, redirecting to /learn');
          navigate("/learn");
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-md">
          <Card className="p-8 bg-card border-border">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">
                Member{" "}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Login
                </span>
              </h1>
              <p className="text-muted-foreground">
                Access your trading education portal
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>Don't have an account?</p>
              <p className="mt-1">
                <a href="/request-access" className="text-primary hover:underline">
                  Request access here
                </a>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
