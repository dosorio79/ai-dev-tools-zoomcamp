import Editor from '@monaco-editor/react';
import { useInterviewStore } from '@/store/interviewStore';
import { api } from '@/api';
import { Button } from './ui/button';
import { Copy } from 'lucide-react';
import { copyToClipboard } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export const CodeEditor = () => {
  const { code, language, setCode } = useInterviewStore();
  const { toast } = useToast();

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined && value !== code) {
      setCode(value);
      // Debounced update to mock API
      const sessionId = useInterviewStore.getState().currentSession?.id;
      if (sessionId) {
        api.updateCode(sessionId, value).catch(() => {
          // Silently ignore; optimistic update
        });
      }
    }
  };

  const getLanguageMode = () => {
    return language === 'javascript' ? 'javascript' : 'python';
  };

  const handleCopyCode = async () => {
    const ok = await copyToClipboard(code);
    toast({
      title: ok ? 'Code copied!' : 'Copy failed',
      description: ok ? undefined : 'Please try again.',
      variant: ok ? 'default' : 'destructive',
    });
  };

  return (
    <div className="h-full border rounded-lg overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/40">
        <span className="text-sm font-medium text-foreground">Editor</span>
        <Button variant="ghost" size="sm" className="gap-2" onClick={handleCopyCode}>
          <Copy className="w-4 h-4" />
          Copy Code
        </Button>
      </div>
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={getLanguageMode()}
          value={code}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
          }}
        />
      </div>
    </div>
  );
};
