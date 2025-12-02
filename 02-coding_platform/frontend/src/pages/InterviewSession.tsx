import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CodeEditor } from '@/components/CodeEditor';
import { UserPresence } from '@/components/UserPresence';
import { ExecutionPanel } from '@/components/ExecutionPanel';
import { api, connectSessionWebSocket, ExecutionResult, WebSocketEvent } from '@/api';
import { useInterviewStore } from '@/store/interviewStore';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { preloadPyodide } from '@/lib/runtime';
import { Button } from '@/components/ui/button';
import { Copy, Share } from 'lucide-react';
import { copyToClipboard } from '@/lib/utils';
import { ShareSessionDialog } from '@/components/ShareSessionDialog';

const normalizeResult = (payload: ExecutionResult) => ({
  ...payload,
  output: payload?.output && payload.output.trim().length > 0 ? payload.output : 'No output captured.'
});

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
    setIsConnected,
    setExecutionResult,
    setWsSend, 
  } = useInterviewStore();
  const [isShareOpen, setIsShareOpen] = useState(false);

  useEffect(() => {
    if (!sessionId || !currentSession || !currentUser) {
      navigate('/');
      return;
    }

    const { disconnect, send } = connectSessionWebSocket(
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
            setExecutionResult(normalizeResult(message.payload));
            break;
        }
      },
      (connected) => setIsConnected(connected)
    );
    setWsSend(send);

    return () => {
      disconnect();
      setWsSend(null);
      setIsConnected(false);
      if (currentUser) {
        api.leaveSession(sessionId, currentUser.id).catch(() => {});
      }
    };
  }, [sessionId, currentSession, currentUser, navigate, addUser, removeUser, setCode, setIsConnected, setWsSend, toast, setLanguage, setExecutionResult]);

  useEffect(() => {
    if (language === 'python') {
      preloadPyodide().catch((error) => {
        toast({
          title: 'Pyodide failed to load',
          description: String(error),
          variant: 'destructive',
        });
      });
    }
  }, [language, toast]);

  const handleLanguageChange = async (newLanguage: 'javascript' | 'python') => {
    if (!sessionId) return;
    await api.changeLanguage(sessionId, newLanguage);
    setLanguage(newLanguage);
  };

  const handleCopySessionId = async () => {
    if (!currentSession) return;
    const ok = await copyToClipboard(currentSession.id);
    toast({
      title: ok ? 'Session ID copied!' : 'Copy failed',
      description: ok ? undefined : 'Please try again.',
      variant: ok ? 'default' : 'destructive',
    });
  };

  const handleShareSession = () => setIsShareOpen(true);

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
            <Button variant="outline" size="sm" className="gap-2" onClick={handleCopySessionId}>
              <Copy className="w-4 h-4" />
              Copy ID
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={handleShareSession}>
              <Share className="w-4 h-4" />
              Share
            </Button>
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

      <ShareSessionDialog sessionId={currentSession.id} open={isShareOpen} onOpenChange={setIsShareOpen} />
    </div>
  );
};

export default InterviewSession;
