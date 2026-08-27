<script lang="ts">
  import { onMount } from 'svelte';
  import Editor from './lib/Editor.svelte';
  import { files, currentFileId, initFiles, updateCurrentFileContent, createNewFile, switchFile } from './lib/stores/files';
  import { diagnostics, tacticState, initLeanWorker, checkLeanCode } from './lib/stores/lean';

  let leftWidth = 66.66; // Initial width in percentage
  let isResizing = false;
  let currentCursorLine = 1;

  onMount(() => {
    initFiles();
    initLeanWorker();
  });

  $: currentFile = $files.find(f => f.id === $currentFileId);
  $: activeContent = currentFile ? currentFile.content : '';

  // Trigger lean worker check when content or cursor changes
  $: {
    if (activeContent !== undefined) {
      checkLeanCode(activeContent, currentCursorLine);
    }
  }

  function handleContentChange(newContent: string) {
    if (currentFile && newContent !== currentFile.content) {
      updateCurrentFileContent(newContent);
    }
  }

  function handleCursorChange(line: number) {
    currentCursorLine = line;
  }

  function handleNewFile() {
    const name = prompt('New file name (e.g. Logic.lean):');
    if (name) {
      createNewFile(name);
    }
  }

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
    <!-- File Tabs -->
    <div class="flex flex-row bg-cyber-dark overflow-x-auto border-b border-gray-800">
      {#each $files as file}
        <button 
          class="px-4 py-2 text-sm font-mono whitespace-nowrap border-r border-gray-800 transition-colors
                 {file.id === $currentFileId ? 'bg-cyber-darker text-cyber-accent border-t-2 border-t-cyber-accent' : 'text-gray-500 hover:text-gray-300'}"
          on:click={() => switchFile(file.id)}
        >
          {file.name}
        </button>
      {/each}
      <button 
        class="px-3 py-2 text-gray-500 hover:text-cyber-glow transition-colors"
        on:click={handleNewFile}
        title="New File"
      >
        +
      </button>
    </div>

    <!-- Editor Workspace -->
    <div class="flex-1 relative">
      {#if currentFile}
        <Editor 
          content={activeContent} 
          leanDiagnostics={$diagnostics}
          onContentChange={handleContentChange} 
          onCursorChange={handleCursorChange}
        />
      {:else}
        <div class="p-4 text-gray-500 font-mono">No file open.</div>
      {/if}
    </div>
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
      <h2 class="text-cyber-glow font-bold mb-2 uppercase tracking-wider text-xs flex justify-between">
        <span>InfoView (Tactic State)</span>
        <span class="text-gray-500 font-normal">Line: {currentCursorLine}</span>
      </h2>
      <div class="text-sm font-mono flex-1 text-gray-300 whitespace-pre-wrap">
        {$tacticState}
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
