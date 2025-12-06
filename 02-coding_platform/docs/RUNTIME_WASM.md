# WASM Runtime for Safe Browser-Side Code Execution

This document describes how code execution works in the Coding Interview
Platform, with secure browser-based execution using WebAssembly (WASM).

Key principle:

    All code execution happens in the browser using WASM.
    The backend never executes user code.

This prevents:
- remote code execution attacks
- sandbox escapes
- backend crashes
- malicious CPU/memory abuse

============================================================
1. Why WASM?
============================================================

Running Python or JavaScript inside the browser provides:
- automatic sandboxing by the browser
- no server resource consumption
- no backend security risk
- simpler deployment
- consistent behavior across environments

Supported languages:
- JavaScript (native iframe execution)
- Python (via Pyodide)

============================================================
2. Libraries Used
============================================================

Language: JavaScript
Library:  sandboxed iframe execution
Reason:   fast, isolated, lightweight

Language: Python
Library:  Pyodide (Python compiled to WebAssembly)
Reason:   safe execution environment, no system access

============================================================
3. High-Level Execution Flow
============================================================

1. User clicks "Run Code".
2. Frontend sends:

       {
         "type": "execute-code",
         "payload": { "language": "python", "code": "print(1+1)" }
       }

3. Backend broadcasts this event (does NOT run code).
4. Browser receives it and runs code in the appropriate runtime.
5. Browser sends back:

       {
         "type": "execution-result",
         "payload": { "output": "2\n", "error": null }
       }

6. All participants see the output.

============================================================
4. JavaScript Execution (iframe Sandbox)
============================================================

JS runs in a sandboxed iframe:

    <iframe sandbox="allow-scripts">
        <script>
            try { parent.postMessage(run(code), "*"); }
            catch (e) { parent.postMessage({ error: e.toString() }, "*"); }
        </script>
    </iframe>

This blocks:
- DOM access
- cookies
- network requests
- storage
- parent window control

============================================================
5. Python Execution (Pyodide)
============================================================

Loading Pyodide:

    const pyodide = await loadPyodide();

Running user code:

    try {
        const output = await pyodide.runPythonAsync(code);
        return { output, error: null };
    } catch (err) {
        return { output: "", error: err.toString() };
    }

Pyodide provides:
- CPython compiled to WASM
- no filesystem access
- no sockets/network
- no subprocesses
- safe execution environment

============================================================
6. Execution Result Format
============================================================

Success:

    {
      "output": "3\n",
      "error": null
    }

Failure:

    {
      "output": "",
      "error": "ReferenceError: x is not defined"
    }

============================================================
7. Security Guarantees
============================================================

Python (Pyodide):
- no file access
- no network
- no system calls
- no threads
- optional timeouts for infinite loops

JavaScript (iframe):
- restricted sandbox
- script-only permissions
- no external API access
- safe crash confinement

Complies with homework requirement:
“Execute code safely in the browser.”

============================================================
8. Error Handling
============================================================

Both runtimes catch:
- syntax errors
- runtime errors
- timeouts
- exceptions

Generic structure:

    { "output": "", "error": "<error_text>" }

============================================================
9. Performance Notes
============================================================

Good for:
- algorithms
- data structures
- string manipulation

Avoid:
- machine learning
- large numeric processing
- heavy Python modules

============================================================
10. Summary
============================================================

Safe browser-only execution: yes  
Supports JavaScript: yes  
Supports Python via WASM: yes  
No backend execution: yes  
Real-time sync via WebSockets: yes  
Secure sandbox: yes  

============================================================
11. Configuring Pyodide Source
============================================================

The frontend loads Pyodide from a configurable base URL. By default it uses:

```
VITE_PYODIDE_BASE=https://cdn.jsdelivr.net/pyodide/v0.27.0/full/
```

To work offline, mirror the Pyodide `full` folder locally (e.g., under `frontend/public/pyodide/`) and set:

```
VITE_PYODIDE_BASE=/pyodide/
```

Ensure the path ends with a trailing slash and restart the frontend dev server after changes.
