import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/api';
import { useInterviewStore } from '@/store/interviewStore';
import { useToast } from '@/hooks/use-toast';

const CreateSession = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setSession, setCurrentUser, addUser } = useInterviewStore();
  
  const [userName, setUserName] = useState('');
  const [language, setLanguage] = useState<'javascript' | 'python'>('javascript');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userName.trim()) {
      toast({
        title: 'Name Required',
        description: 'Please enter your name to continue',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);

    try {
      // Create session
      const session = await api.createSession(language);
      const { user } = await api.joinSession(session.id, userName);
      
      // Update store
      setSession(session);
      setCurrentUser(user);
      addUser(user);

      toast({
        title: 'Session Created!',
        description: `Session ${session.id} is ready`,
      });

      // Navigate to interview page
      navigate(`/interview/${session.id}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create session',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Code2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Create Session</h1>
            <p className="text-sm text-muted-foreground">Start a new coding interview</p>
          </div>
        </div>

        <form onSubmit={handleCreate} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="userName">Your Name</Label>
            <Input
              id="userName"
              placeholder="Enter your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              disabled={isCreating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Programming Language</Label>
            <Select
              value={language}
              onValueChange={(value) => setLanguage(value as 'javascript' | 'python')}
              disabled={isCreating}
            >
              <SelectTrigger id="language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="python">Python</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={isCreating}>
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Session...
              </>
            ) : (
              'Create Session'
            )}
          </Button>
        </form>

        <div className="mt-6 p-4 rounded-lg bg-muted/50">
          <p className="text-xs text-muted-foreground">
            After creating the session, you'll get a unique Session ID that others can use to join.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default CreateSession;
