<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { EditorState } from '@codemirror/state';
  import { EditorView, keymap, lineNumbers } from '@codemirror/view';
  import { defaultKeymap, indentWithTab } from '@codemirror/commands';
  import { oneDark } from '@codemirror/theme-one-dark';
  import { StreamLanguage } from '@codemirror/language';
  import { lintGutter, linter, type Diagnostic } from '@codemirror/lint';
  import type { LeanDiagnostic } from './workers/leanWorker';

  export let content = '';
  export let leanDiagnostics: LeanDiagnostic[] = [];
  export let onContentChange: (newContent: string) => void = () => {};
  export let onCursorChange: (newLine: number) => void = () => {};
  
  let editorContainer: HTMLDivElement;
  let editorView: EditorView;
  let internalContent = content;

  const simpleLean = StreamLanguage.define({
    token(stream) {
      if (stream.match(/^(def|theorem|lemma|example|class|structure|instance|namespace|section|end|import|open|variable|universe|#check|#eval|#print|#reduce)\b/)) {
        return 'keyword';
      }
      if (stream.match(/^(∀|∃|λ|→|↔|=>|:=|:=|=>)/)) {
        return 'operator';
      }
      if (stream.match(/^--.*/)) {
        return 'comment';
      }
      if (stream.match(/^\/-[\s\S]*?-\//)) {
        return 'comment';
      }
      stream.next();
      return null;
    }
  });

  // Convert LeanDiagnostics to CodeMirror Diagnostics
  function getCMLinter() {
    return linter((view) => {
      const cmDiagnostics: Diagnostic[] = [];
      const doc = view.state.doc;
      
      for (const diag of leanDiagnostics) {
        // Safe line extraction (1-based from lean to 1-based CM, clamped)
        const lineNo = Math.max(1, Math.min(diag.line, doc.lines));
        const line = doc.line(lineNo);
        cmDiagnostics.push({
          from: line.from,
          to: line.to,
          severity: diag.severity,
          message: diag.message
        });
      }
      
      return cmDiagnostics;
    });
  }

  onMount(() => {
    const state = EditorState.create({
      doc: content,
      extensions: [
        lineNumbers(),
        lintGutter(),
        keymap.of([...defaultKeymap, indentWithTab]),
        oneDark,
        simpleLean,
        getCMLinter(),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const newContent = update.state.doc.toString();
            internalContent = newContent;
            onContentChange(newContent);
          }
          if (update.selectionSet || update.docChanged) {
            const head = update.state.selection.main.head;
            const line = update.state.doc.lineAt(head).number;
            onCursorChange(line);
          }
        }),
      ],
    });

    editorView = new EditorView({
      state,
      parent: editorContainer,
    });
  });

  onDestroy(() => {
    if (editorView) {
      editorView.destroy();
    }
  });

  // Watch for external content changes
  $: if (editorView && content !== internalContent) {
    internalContent = content;
    editorView.dispatch({
      changes: {
        from: 0,
        to: editorView.state.doc.length,
        insert: content
      }
    });
  }

  // Force re-lint when diagnostics change
  $: if (editorView && leanDiagnostics) {
    editorView.dispatch({});
  }

</script>

<div class="h-full w-full overflow-hidden" bind:this={editorContainer}></div>

<style>
  :global(.cm-editor) {
    height: 100%;
  }
  :global(.cm-scroller) {
    font-family: 'Fira Code', 'Cascadia Code', Consolas, monospace;
  }
</style>