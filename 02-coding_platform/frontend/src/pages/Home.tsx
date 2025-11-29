import { Link } from 'react-router-dom';
import { Code2, Users, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const Home = () => {
  const features = [
    {
      icon: Code2,
      title: 'Real-time Collaboration',
      description: 'Code together with syntax highlighting for JavaScript and Python',
    },
    {
      icon: Users,
      title: 'Live Presence',
      description: 'See who\'s in the session and track participant activity',
    },
    {
      icon: Zap,
      title: 'Instant Execution',
      description: 'Run your code and see results immediately',
    },
    {
      icon: Shield,
      title: 'Secure Sessions',
      description: 'Private interview sessions with unique identifiers',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/10">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <Code2 className="w-5 h-5" />
            <span className="text-sm font-semibold">CodeCollab Interview Platform</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
            Collaborative Coding
            <br />
            <span className="text-primary">Interviews Made Easy</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Real-time code collaboration platform designed for technical interviews
            with live editing, execution, and participant tracking
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button asChild size="lg" className="text-lg px-8">
              <Link to="/create">
                <Code2 className="w-5 h-5 mr-2" />
                Create Session
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8">
              <Link to="/join">
                <Users className="w-5 h-5 mr-2" />
                Join Session
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <feature.icon className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>

        <div className="mt-20 text-center">
          <Card className="inline-block p-8 bg-primary/5">
            <h2 className="text-2xl font-bold mb-4 text-foreground">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8 mt-6 text-left">
              <div>
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mb-3">1</div>
                <h3 className="font-semibold mb-2 text-foreground">Create or Join</h3>
                <p className="text-sm text-muted-foreground">Start a new session or join an existing one with a session ID</p>
              </div>
              <div>
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mb-3">2</div>
                <h3 className="font-semibold mb-2 text-foreground">Code Together</h3>
                <p className="text-sm text-muted-foreground">Write and edit code collaboratively in real-time</p>
              </div>
              <div>
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mb-3">3</div>
                <h3 className="font-semibold mb-2 text-foreground">Execute & Review</h3>
                <p className="text-sm text-muted-foreground">Run code and see results instantly</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;
