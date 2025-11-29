import Editor from '@monaco-editor/react';
import { useInterviewStore } from '@/store/interviewStore';
import { mockApi } from '@/api/mockApi';

export const CodeEditor = () => {
  const { code, language, setCode } = useInterviewStore();

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined && value !== code) {
      setCode(value);
      // Debounced update to mock API
      const sessionId = useInterviewStore.getState().currentSession?.id;
      if (sessionId) {
        mockApi.updateCode(sessionId, value);
      }
    }
  };

  const getLanguageMode = () => {
    return language === 'javascript' ? 'javascript' : 'python';
  };

  return (
    <div className="h-full border rounded-lg overflow-hidden">
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
  );
};
