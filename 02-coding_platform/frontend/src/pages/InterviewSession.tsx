import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CodeEditor } from '@/components/CodeEditor';
import { UserPresence } from '@/components/UserPresence';
import { ExecutionPanel } from '@/components/ExecutionPanel';
import { mockApi, mockWebSocket, WebSocketMessage } from '@/api/mockApi';
import { useInterviewStore } from '@/store/interviewStore';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';

const InterviewSession = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    currentSession, 
    currentUser,
    setCode,
    setLanguage,
    addUser,
    removeUser,
    setIsConnected 
  } = useInterviewStore();

  useEffect(() => {
    if (!sessionId || !currentSession || !currentUser) {
      navigate('/');
      return;
    }

    // Simulate WebSocket connection
    setIsConnected(true);

    // Set up mock WebSocket listener
    const cleanup = mockWebSocket.connect(sessionId, (message: WebSocketMessage) => {
      switch (message.type) {
        case 'code_change':
          setCode(message.payload.code);
          break;
        
        case 'user_joined':
          addUser(message.payload);
          toast({
            title: 'User Joined',
            description: `${message.payload.name} joined the session`,
          });
          break;
        
        case 'user_left':
          removeUser(message.payload.userId);
          toast({
            title: 'User Left',
            description: 'A user left the session',
          });
          break;
        
        case 'language_change':
          setLanguage(message.payload.language);
          setCode(message.payload.code);
          toast({
            title: 'Language Changed',
            description: `Switched to ${message.payload.language}`,
          });
          break;
      }
    });

    // Simulate activity for demo purposes
    const stopActivity = mockWebSocket.simulateActivity(sessionId);

    return () => {
      cleanup();
      stopActivity();
      setIsConnected(false);
      if (currentUser) {
        mockApi.leaveSession(sessionId, currentUser.id);
      }
    };
  }, [sessionId, currentSession, currentUser, navigate]);

  const handleLanguageChange = async (newLanguage: 'javascript' | 'python') => {
    if (!sessionId) return;
    
    await mockApi.changeLanguage(sessionId, newLanguage);
  };

  if (!currentSession || !currentUser) {
    return null;
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col p-4 gap-4">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Interview Session: {currentSession.id}
            </h2>
            <p className="text-sm text-muted-foreground">
              Logged in as {currentUser.name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Language:</span>
            <Select
              value={currentSession.language}
              onValueChange={(value) => handleLanguageChange(value as 'javascript' | 'python')}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="python">Python</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <div className="flex-1 grid lg:grid-cols-[1fr_300px] gap-4 min-h-0">
        <div className="flex flex-col gap-4 min-h-0">
          <Card className="flex-[2] min-h-0 p-4">
            <CodeEditor />
          </Card>
          <Card className="flex-1 min-h-[200px] p-4">
            <ExecutionPanel />
          </Card>
        </div>

        <Card className="p-4 overflow-auto">
          <UserPresence />
        </Card>
      </div>
    </div>
  );
};

export default InterviewSession;
