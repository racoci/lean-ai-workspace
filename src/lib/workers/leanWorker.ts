// leanWorker.ts
import { Lean4 } from 'lean4.js';

export type LeanRequest = {
  id: number;
  method: 'check';
  content: string;
  cursorLine: number;
};

export type LeanDiagnostic = {
  line: number;
  column: number;
  severity: 'error' | 'warning' | 'info'; 
  message: string;
};

export type LeanResponse = {
  id: number;
  diagnostics: LeanDiagnostic[];
  tacticState: string;
};

let leanEngine: Lean4 | null = null;
let isInitializing = false;
let initPromise: Promise<void> | null = null;

async function getLean(): Promise<Lean4 | null> {
  if (leanEngine) return leanEngine;
  if (!isInitializing) {
    isInitializing = true;
    console.log("Initializing Lean4 WASM...");
    initPromise = (async () => {
      try {
        const engine = new Lean4();
        await engine.init();
        leanEngine = engine;
        console.log("Lean4 WASM initialized.");
      } catch (e) {
        console.error("Failed to initialize Lean4 WASM:", e);
      }
    })();
  }
  await initPromise;
  return leanEngine;
}

// Fallback logic
async function runMockCheck(req: LeanRequest): Promise<LeanResponse> {
  await new Promise(r => setTimeout(r, 600));
  const diagnostics: LeanDiagnostic[] = [];
  let tacticState = "No goals.";

  if (req.content.includes('sorry')) {
    const sorryLine = req.content.split('sorry')[0].split('\n').length;
    diagnostics.push({
      line: sorryLine,
      column: 0,
      severity: 'warning',
      message: 'declaration uses \'sorry\' (Mock)'
    });
    if (req.cursorLine === sorryLine) {
      tacticState = "1 goal\n⊢ True";
    }
  }

  if (req.content.includes('foo')) {
    const fooLine = req.content.split('foo')[0].split('\n').length;
    diagnostics.push({
      line: fooLine,
      column: 0,
      severity: 'error',
      message: 'unknown identifier \'foo\' (Mock)'
    });
  }

  return { id: req.id, diagnostics, tacticState };
}

self.onmessage = async (e: MessageEvent<LeanRequest>) => {
  const req = e.data;
  if (req.method === 'check') {
    try {
      const engine = await getLean();
      if (!engine) {
        // Fallback to mock if engine failed to load
        const fallbackRes = await runMockCheck(req);
        self.postMessage(fallbackRes);
        return;
      }

      const res = await engine.run(req.content);
      const diagnostics: LeanDiagnostic[] = [];
      
      // We parse Lean's stdout/stderr which often outputs JSON lines when run with --json
      // Or we just present the raw output in InfoView for this prototype.
      const rawOutput = res.stdout + '\n' + res.stderr;
      let tacticState = "WASM output:\n" + rawOutput.trim();
      if (!rawOutput.trim()) {
        tacticState = "No goals / compilation succeeded.";
      }
      
      self.postMessage({
        id: req.id,
        diagnostics,
        tacticState
      } as LeanResponse);
      
    } catch (err: any) {
      console.error(err);
      // Fallback
      const fallbackRes = await runMockCheck(req);
      self.postMessage(fallbackRes);
    }
  }
};
