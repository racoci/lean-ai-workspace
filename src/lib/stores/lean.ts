import { writable } from 'svelte/store';
import type { LeanDiagnostic, LeanRequest, LeanResponse } from '../workers/leanWorker';

export const diagnostics = writable<LeanDiagnostic[]>([]);
export const tacticState = writable<string>('Initializing Lean 4 WASM...');

let worker: Worker;
let messageId = 0;

export function initLeanWorker() {
  if (typeof window !== 'undefined' && !worker) {
    worker = new Worker(new URL('../workers/leanWorker.ts', import.meta.url), { type: 'module' });
    
    worker.onmessage = (e: MessageEvent<LeanResponse>) => {
      const res = e.data;
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
