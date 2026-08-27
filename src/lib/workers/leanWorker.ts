// leanWorker.ts

export type LeanRequest = {
  id: number;
  method: 'check';
  content: string;
  cursorLine: number;
};

export type LeanDiagnostic = {
  line: number;
  column: number;
  severity: 'error' | 'warning' | 'info'; // 'information' is not standard for cm
  message: string;
};

export type LeanResponse = {
  id: number;
  diagnostics: LeanDiagnostic[];
  tacticState: string;
};

self.onmessage = async (e: MessageEvent<LeanRequest>) => {
  const req = e.data;
  if (req.method === 'check') {
    // Simulate compilation delay
    await new Promise(r => setTimeout(r, 600));

    const diagnostics: LeanDiagnostic[] = [];
    let tacticState = "No goals.";

    // Very naive fake validation for prototype purposes
    if (req.content.includes('sorry')) {
      const sorryLine = req.content.split('sorry')[0].split('\n').length;
      diagnostics.push({
        line: sorryLine,
        column: 0,
        severity: 'warning',
        message: 'declaration uses \'sorry\''
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
        message: 'unknown identifier \'foo\''
      });
    }

    self.postMessage({
      id: req.id,
      diagnostics,
      tacticState
    } as LeanResponse);
  }
};
