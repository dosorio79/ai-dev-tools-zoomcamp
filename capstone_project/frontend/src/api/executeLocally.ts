import type { ExecutionResult, Language } from '@/types/execution';

type PyodideResult = string | { output?: string; error?: string };

type PyodideInstance = {
  runPythonAsync: (code: string) => Promise<PyodideResult>;
  loadPackagesFromImports?: (code: string) => Promise<void>;
  loadPackage?: (names: string | string[]) => Promise<void>;
};

declare global {
  interface Window {
    loadPyodide?: (options: { indexURL: string }) => Promise<PyodideInstance>;
  }
}

const DEFAULT_PYODIDE_BASE = 'https://cdn.jsdelivr.net/pyodide/v0.27.0/full/';
const OPTIONAL_PYODIDE_PACKAGES = ['numpy', 'pandas'] as const;

let pyodideInstance: PyodideInstance | null = null;
let pyodideLoading: Promise<PyodideInstance> | null = null;

const getPyodideBase = () => {
  const envBase = import.meta.env?.VITE_PYODIDE_BASE as string | undefined;
  const base = envBase?.trim() || DEFAULT_PYODIDE_BASE;
  const withSlash = base.endsWith('/') ? base : `${base}/`;
  if (/^https?:\/\//i.test(withSlash)) return withSlash;
  if (typeof window === 'undefined') return withSlash;
  return new URL(withSlash, window.location.origin).toString();
};

const injectPyodideScript = (base: string) =>
  new Promise<void>((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Pyodide is only available in the browser'));
      return;
    }

    if (typeof window.loadPyodide === 'function') {
      resolve();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>('script[data-pyodide-loader]');
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Pyodide script failed to load')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = `${base}pyodide.js`;
    script.async = true;
    script.dataset.pyodideLoader = 'true';
    script.onload = () => resolve();
    script.onerror = () =>
      reject(
        new Error(
          `Pyodide script failed to load from ${script.src}. Set VITE_PYODIDE_BASE if hosting locally.`
        )
      );
    document.head.appendChild(script);
  });

const loadPyodideInstance = async (): Promise<PyodideInstance> => {
  if (pyodideInstance) return pyodideInstance;
  const configuredBase = getPyodideBase();

  if (!pyodideLoading) {
    pyodideLoading = (async () => {
      let resolvedBase = configuredBase;
      try {
        await injectPyodideScript(resolvedBase);
      } catch (err) {
        if (resolvedBase !== DEFAULT_PYODIDE_BASE) {
          resolvedBase = DEFAULT_PYODIDE_BASE;
          await injectPyodideScript(resolvedBase);
        } else {
          throw err;
        }
      }

      if (typeof window.loadPyodide !== 'function') {
        throw new Error('Failed to load Pyodide (window.loadPyodide missing)');
      }

      const instance = await window.loadPyodide({ indexURL: resolvedBase });

      if (instance.loadPackage) {
        for (const pkg of OPTIONAL_PYODIDE_PACKAGES) {
          try {
            await instance.loadPackage(pkg);
          } catch (error) {
            console.warn(`Optional Pyodide package "${pkg}" failed to load`, error);
          }
        }
      }
      pyodideInstance = instance;
      return instance;
    })();
  }

  try {
    pyodideInstance = await pyodideLoading;
  } catch (err) {
    pyodideLoading = null;
    throw err;
  }

  return pyodideInstance;
};

export const preloadPyodide = async () =>
  loadPyodideInstance().catch((err) => {
    pyodideLoading = null;
    throw err;
  });

const runJavaScript = async (code: string): Promise<ExecutionResult> =>
  new Promise((resolve) => {
    const iframe = document.createElement('iframe');
    iframe.sandbox.add('allow-scripts');
    iframe.style.display = 'none';

    const handleMessage = (event: MessageEvent) => {
      if (event.source !== iframe.contentWindow) return;
      window.removeEventListener('message', handleMessage);
      iframe.remove();
      const data = event.data as { output: string; error: string | null };
      resolve({
        output: data?.output ?? '',
        error: data?.error ?? null,
        timestamp: new Date().toISOString(),
      });
    };

    window.addEventListener('message', handleMessage);

    const escapedCode = code.replace(/<\/script>/gi, '<\\/script>');
    iframe.srcdoc = `
      <script>
        (function() {
          const logs = [];
          const originalLog = console.log;
          console.log = (...args) => {
            logs.push(args.map(String).join(" "));
          };
          let error = null;
          try {
            const result = (function() { ${escapedCode} })();
            if (result !== undefined) {
              logs.push(String(result));
            }
          } catch (err) {
            error = String(err);
          } finally {
            console.log = originalLog;
            const output = logs.join("\\n");
            parent.postMessage({ output, error }, "*");
          }
        })();
      </script>
    `;

    document.body.appendChild(iframe);
  });

const runPython = async (code: string): Promise<ExecutionResult> => {
  const pyodide = await preloadPyodide();

  try {
    await pyodide.loadPackagesFromImports?.(code).catch(() => undefined);

    const raw = await pyodide.runPythonAsync(`
import sys, io, traceback, textwrap, json, warnings
warnings.filterwarnings("ignore")
_buffer = io.StringIO()
_stdout, _stderr = sys.stdout, sys.stderr
sys.stdout = _buffer
sys.stderr = _buffer
_error = None
try:
    exec(textwrap.dedent(${JSON.stringify(code)}), {})
except Exception as e:
    _error = ''.join(traceback.format_exception(e))
finally:
    sys.stdout = _stdout
    sys.stderr = _stderr
json.dumps({"output": _buffer.getvalue(), "error": _error})
`);
    const parsed = JSON.parse(typeof raw === 'string' ? raw : String(raw));
    return {
      output: parsed.output || '',
      error: parsed.error,
      timestamp: new Date().toISOString(),
    };
  } catch (err: unknown) {
    return {
      output: '',
      error: err instanceof Error ? err.message : String(err),
      timestamp: new Date().toISOString(),
    };
  }
};

export const executeLocally = async (
  language: Language,
  code: string
): Promise<ExecutionResult> => {
  if (language === 'python') {
    return runPython(code);
  }
  return runJavaScript(code);
};
