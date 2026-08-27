import { writable } from 'svelte/store';
import { Lean4 } from 'lean4.js';
import type { LeanDiagnostic, LeanRequest, LeanResponse } from '../workers/leanWorker';

export const diagnostics = writable<LeanDiagnostic[]>([]);
export const tacticState = writable<string>('Initializing Lean 4 WASM...');
export const isVerifying = writable<boolean>(false);

let worker: Worker;
let messageId = 0;

export function initLeanWorker() {
  if (typeof window !== 'undefined' && !worker) {
    worker = new Worker(new URL('../workers/leanWorker.ts', import.meta.url), { type: 'module' });
    
    worker.onmessage = (e: MessageEvent<LeanResponse>) => {
      const res = e.data;
      // When the worker responds, we only update if we are not doing a full verify
      diagnostics.set(res.diagnostics);
      tacticState.set(res.tacticState);
    };

    tacticState.set('Lean 4 Ready. No goals.');
  }
}

export function checkLeanCode(content: string, cursorLine: number = 1) {
  if (worker) {
    const req: LeanRequest = {
      id: ++messageId,
      method: 'check',
      content,
      cursorLine
    };
    worker.postMessage(req);
  }
}

let leanEngine: Lean4 | null = null;
let initPromise: Promise<void> | null = null;

export async function runFullVerification(content: string) {
  isVerifying.set(true);
  tacticState.set('Downloading/Initializing full Lean 4 WASM bundle (this may take a minute on first run)...\n\nPlease wait...');
  
  try {
    if (!initPromise) {
      const engine = new Lean4();
      initPromise = engine.init();
      leanEngine = engine;
    }
    
    await initPromise;
    
    if (leanEngine) {
      tacticState.set('Compiling code...');
      const res = await leanEngine.run(content);
      const rawOutput = res.stdout + '\n' + res.stderr;
      
      let outState = "WASM Compilation Output:\n\n" + rawOutput.trim();
      if (!rawOutput.trim()) {
        outState = "Compilation succeeded without errors or warnings.";
      }
      
      tacticState.set(outState);
    }
  } catch (err: any) {
    tacticState.set('Full verification failed: ' + err.message);
  } finally {
    isVerifying.set(false);
  }
}
