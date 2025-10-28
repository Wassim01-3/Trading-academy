import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { BookOpen, TrendingUp, Users, Shield, Award, BarChart3 } from "lucide-react";
import logo from "@/assets/logo.png";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-8">
            <img 
              src={logo} 
              alt="Trade Academy Logo" 
              className="h-32 w-32 mx-auto animate-pulse"
              style={{ filter: 'drop-shadow(0 0 40px hsl(45 93% 47% / 0.4))' }}
            />
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Master the Art of{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Trading
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join our premium trading academy and learn from industry experts. 
              Transform your financial future with professional trading strategies.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/request-access">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:shadow-[0_0_40px_hsl(45_93%_47%/0.4)] transition-all"
                >
                  Start Learning Today
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10">
                  Member Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-card">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why Choose{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Our Academy
            </span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6 bg-background border-border hover:border-primary/50 transition-all hover:shadow-[0_0_20px_hsl(45_93%_47%/0.2)]">
              <BookOpen className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Comprehensive Courses</h3>
              <p className="text-muted-foreground">
                From beginner to advanced, our structured curriculum covers all aspects of trading.
              </p>
            </Card>

            <Card className="p-6 bg-background border-border hover:border-primary/50 transition-all hover:shadow-[0_0_20px_hsl(45_93%_47%/0.2)]">
              <TrendingUp className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Live Market Analysis</h3>
              <p className="text-muted-foreground">
                Real-time insights and analysis to help you make informed trading decisions.
              </p>
            </Card>

            <Card className="p-6 bg-background border-border hover:border-primary/50 transition-all hover:shadow-[0_0_20px_hsl(45_93%_47%/0.2)]">
              <Users className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Expert Mentorship</h3>
              <p className="text-muted-foreground">
                Learn directly from professional traders with years of market experience.
              </p>
            </Card>

            <Card className="p-6 bg-background border-border hover:border-primary/50 transition-all hover:shadow-[0_0_20px_hsl(45_93%_47%/0.2)]">
              <Shield className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Risk Management</h3>
              <p className="text-muted-foreground">
                Master the crucial skills of protecting your capital and managing trades.
              </p>
            </Card>

            <Card className="p-6 bg-background border-border hover:border-primary/50 transition-all hover:shadow-[0_0_20px_hsl(45_93%_47%/0.2)]">
              <Award className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Proven Strategies</h3>
              <p className="text-muted-foreground">
                Access battle-tested trading strategies that consistently deliver results.
              </p>
            </Card>

            <Card className="p-6 bg-background border-border hover:border-primary/50 transition-all hover:shadow-[0_0_20px_hsl(45_93%_47%/0.2)]">
              <BarChart3 className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Technical Analysis</h3>
              <p className="text-muted-foreground">
                Deep dive into chart patterns, indicators, and advanced trading techniques.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* About Trading Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
            What is{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Trading?
            </span>
          </h2>
          <div className="space-y-6 text-lg text-muted-foreground">
            <p>
              Trading is the act of buying and selling financial instruments like stocks, currencies, 
              commodities, and cryptocurrencies with the goal of generating profits. It requires a 
              combination of knowledge, strategy, discipline, and risk management.
            </p>
            <p>
              Successful trading isn't about luck—it's about understanding market dynamics, 
              recognizing patterns, and making informed decisions based on analysis and research. 
              Whether you're interested in day trading, swing trading, or long-term investing, 
              mastering the fundamentals is essential.
            </p>
            <p>
              Our academy provides you with the tools, knowledge, and support needed to navigate 
              the markets confidently and build a sustainable trading career.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Plans Section */}
      <section className="py-20 px-4 bg-card">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Choose Your{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Learning Path
            </span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 bg-background border-border hover:border-primary/50 transition-all">
              <h3 className="text-2xl font-bold mb-4">Basic</h3>
              <p className="text-muted-foreground mb-6">Perfect for beginners starting their trading journey</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Fundamentals of Trading</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Basic Technical Analysis</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Risk Management Basics</span>
                </li>
              </ul>
              <Link to="/request-access">
                <Button className="w-full" variant="outline">Get Started</Button>
              </Link>
            </Card>

            <Card className="p-8 bg-background border-primary shadow-[0_0_30px_hsl(45_93%_47%/0.3)]">
              <div className="text-xs font-semibold text-primary mb-2">MOST POPULAR</div>
              <h3 className="text-2xl font-bold mb-4">Advanced</h3>
              <p className="text-muted-foreground mb-6">For serious traders ready to level up</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Everything in Basic</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Advanced Chart Patterns</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Live Trading Sessions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Weekly Market Analysis</span>
                </li>
              </ul>
              <Link to="/request-access">
                <Button className="w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground">
                  Get Started
                </Button>
              </Link>
            </Card>

            <Card className="p-8 bg-background border-border hover:border-primary/50 transition-all">
              <h3 className="text-2xl font-bold mb-4">Premium</h3>
              <p className="text-muted-foreground mb-6">Elite training for professional traders</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Everything in Advanced</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>1-on-1 Mentorship</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Exclusive Trading Strategies</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Priority Support</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Private Community Access</span>
                </li>
              </ul>
              <Link to="/request-access">
                <Button className="w-full" variant="outline">Get Started</Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Trading Journey?
            </span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join hundreds of successful traders who transformed their financial future
          </p>
          <Link to="/request-access">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:shadow-[0_0_40px_hsl(45_93%_47%/0.4)] transition-all"
            >
              Request Access Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto max-w-6xl text-center text-muted-foreground">
          <p>&copy; 2025 Trade Academy. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
