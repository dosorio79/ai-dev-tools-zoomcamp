import { Link } from 'react-router-dom';
import { Code2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInterviewStore } from '@/store/interviewStore';

export const Header = () => {
  const { currentSession, users, isConnected } = useInterviewStore();

  return (
    <header className="border-b bg-card shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Code2 className="w-6 h-6 text-primary" />
          <span className="text-xl font-bold">CodeCollab</span>
        </Link>

        {currentSession && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-destructive'}`} />
              <span className="text-sm text-muted-foreground">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">{users.length} online</span>
            </div>

            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-md bg-muted">
              <span className="text-xs text-muted-foreground">Session ID:</span>
              <code className="text-xs font-mono font-semibold">{currentSession.id}</code>
            </div>
          </div>
        )}

        {!currentSession && (
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/create">Create Session</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/join">Join Session</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};
