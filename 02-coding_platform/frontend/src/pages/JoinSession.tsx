import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { mockApi } from '@/api/mockApi';
import { useInterviewStore } from '@/store/interviewStore';
import { useToast } from '@/hooks/use-toast';

const JoinSession = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setSession, setCurrentUser, setUsers } = useInterviewStore();
  
  const [sessionId, setSessionId] = useState('');
  const [userName, setUserName] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userName.trim() || !sessionId.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please enter both your name and session ID',
        variant: 'destructive',
      });
      return;
    }

    setIsJoining(true);

    try {
      // Join session
      const { session, user } = await mockApi.joinSession(sessionId, userName);
      
      // Get all users
      const allUsers = await mockApi.getSessionUsers(sessionId);
      
      // Update store
      setSession(session);
      setCurrentUser(user);
      setUsers(allUsers);

      toast({
        title: 'Joined Successfully!',
        description: `Welcome to session ${session.id}`,
      });

      // Navigate to interview page
      navigate(`/interview/${session.id}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Session not found or failed to join',
        variant: 'destructive',
      });
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Join Session</h1>
            <p className="text-sm text-muted-foreground">Join an existing coding interview</p>
          </div>
        </div>

        <form onSubmit={handleJoin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="userName">Your Name</Label>
            <Input
              id="userName"
              placeholder="Enter your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              disabled={isJoining}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sessionId">Session ID</Label>
            <Input
              id="sessionId"
              placeholder="Enter session ID"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              disabled={isJoining}
              className="font-mono"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isJoining}>
            {isJoining ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Joining...
              </>
            ) : (
              'Join Session'
            )}
          </Button>
        </form>

        <div className="mt-6 p-4 rounded-lg bg-muted/50">
          <p className="text-xs text-muted-foreground">
            Ask the session host for the Session ID to join their coding interview.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default JoinSession;
