<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { EditorState } from '@codemirror/state';
  import { EditorView, keymap, lineNumbers } from '@codemirror/view';
  import { defaultKeymap, indentWithTab } from '@codemirror/commands';
  import { oneDark } from '@codemirror/theme-one-dark';
  import { StreamLanguage } from '@codemirror/language';

  export let content = '';
  export let onContentChange: (newContent: string) => void = () => {};
  
  let editorContainer: HTMLDivElement;
  let editorView: EditorView;
  let internalContent = content; // prevent cyclic updates

  // Basic syntax highlighting for Lean (using a simple stream language definition)
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
      if (stream.match(/^\/-[\s\S]*?-\//)) { // simplified block comment
        return 'comment';
      }
      stream.next();
      return null;
    }
  });

  onMount(() => {
    const state = EditorState.create({
      doc: content,
      extensions: [
        lineNumbers(),
        keymap.of([...defaultKeymap, indentWithTab]),
        oneDark,
        simpleLean,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const newContent = update.state.doc.toString();
            internalContent = newContent;
            onContentChange(newContent);
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

  // Watch for external content changes (e.g. switching tabs)
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