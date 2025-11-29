import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CodeEditor } from '@/components/CodeEditor';
import { UserPresence } from '@/components/UserPresence';
import { ExecutionPanel } from '@/components/ExecutionPanel';
import { api, connectSessionWebSocket, WebSocketEvent } from '@/api/client';
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
    language,
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

    const disconnect = connectSessionWebSocket(
      sessionId,
      (message: WebSocketEvent) => {
        switch (message.type) {
          case 'code_change':
            setCode(message.payload.code);
            break;
          case 'user_joined':
            addUser(message.payload.user);
            toast({
              title: 'User Joined',
              description: `${message.payload.user.name} joined the session`,
            });
            break;
          case 'user_left':
            removeUser(message.payload.user.id);
            toast({
              title: 'User Left',
              description: `${message.payload.user.name} left the session`,
            });
            break;
          case 'language_change':
            setLanguage(message.payload.language);
            toast({
              title: 'Language Changed',
              description: `Switched to ${message.payload.language}`,
            });
            break;
          case 'execution_result':
            // handled in ExecutionPanel via direct API call; ignore broadcasts here
            break;
        }
      },
      (connected) => setIsConnected(connected)
    );

    return () => {
      disconnect();
      setIsConnected(false);
      if (currentUser) {
        api.leaveSession(sessionId, currentUser.id).catch(() => {});
      }
    };
  }, [sessionId, currentSession, currentUser, navigate]);

  const handleLanguageChange = async (newLanguage: 'javascript' | 'python') => {
    if (!sessionId) return;
    await api.changeLanguage(sessionId, newLanguage);
    setLanguage(newLanguage);
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
              value={language}
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
