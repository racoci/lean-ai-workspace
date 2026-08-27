<script lang="ts">
  import Editor from './lib/Editor.svelte';

  let initialCode = `-- Welcome to Lean AI Workspace\n\n#eval "Hello, world!"\n\ndef myTheorem : 1 + 1 = 2 := rfl\n`;
  let leftWidth = 66.66; // Initial width in percentage
  let isResizing = false;

  function startResize() {
    isResizing = true;
  }

  function doResize(event: MouseEvent) {
    if (!isResizing) return;
    const newWidth = (event.clientX / window.innerWidth) * 100;
    if (newWidth > 20 && newWidth < 80) { // Limit min/max widths
      leftWidth = newWidth;
    }
  }

  function stopResize() {
    isResizing = false;
  }
</script>

<svelte:window 
  on:mousemove={doResize} 
  on:mouseup={stopResize} 
  on:mouseleave={stopResize} 
/>

<main class="h-screen w-screen flex flex-row bg-cyber-darker text-cyber-text overflow-hidden" class:cursor-col-resize={isResizing}>
  
  <!-- Central Panel: Editor -->
  <section style="width: {leftWidth}%" class="h-full relative flex flex-col min-w-0">
    <Editor bind:content={initialCode} />
  </section>

  <!-- Resizer Handle -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div 
    class="w-1 cursor-col-resize bg-cyber-dark hover:bg-cyber-glow transition-colors z-10 flex-shrink-0"
    on:mousedown={startResize}
  ></div>

  <!-- Right Panel: InfoView and AI Chat -->
  <aside style="width: {100 - leftWidth}%" class="flex flex-col h-full bg-cyber-dark min-w-0">
    <!-- Top Right: InfoView -->
    <section class="flex-1 border-b border-cyber-darker overflow-auto p-4 flex flex-col">
      <h2 class="text-cyber-glow font-bold mb-2 uppercase tracking-wider text-xs">InfoView (Tactic State)</h2>
      <div class="text-sm font-mono flex-1 text-gray-300">
        ⊢ Goals will appear here
      </div>
    </section>

    <!-- Bottom Right: AI Co-Pilot Chat -->
    <section class="flex-1 overflow-auto p-4 flex flex-col">
      <h2 class="text-cyber-accent font-bold mb-2 uppercase tracking-wider text-xs">AI Co-Pilot</h2>
      <div class="flex-1 overflow-y-auto mb-3 text-sm text-gray-400 font-mono">
        > Co-Pilot initialized. Ready to assist with proofs.
      </div>
      <div class="mt-auto">
        <input 
          type="text" 
          placeholder="Ask the AI for a tactic or explanation..." 
          class="w-full p-2 bg-cyber-darker border border-gray-700 rounded text-cyber-text text-sm focus:outline-none focus:border-cyber-glow font-mono transition-colors"
        />
      </div>
    </section>
  </aside>
</main>
