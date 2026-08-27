<script lang="ts">
  import { onMount } from 'svelte';
  import Editor from './lib/Editor.svelte';
  import SettingsModal from './lib/SettingsModal.svelte';
  import CopilotChat from './lib/CopilotChat.svelte';
  import FileExplorer from './lib/FileExplorer.svelte';
  import { files, currentFileId, initFiles, updateCurrentFileContent } from './lib/stores/files';
  import { diagnostics, tacticState, isVerifying, initLeanWorker, checkLeanCode, runFullVerification } from './lib/stores/lean';
  import { initSettings } from './lib/stores/settings';
  import { initTelemetry } from './lib/stores/telemetry';

  let leftWidth = 20; // Explorer width
  let centerWidth = 50; // Editor width
  
  let isResizingExplorer = false;
  let isResizingEditor = false;
  let currentCursorLine = 1;
  let showSettings = false;

  onMount(async () => {
    await initSettings();
    await initTelemetry();
    await initFiles();
    initLeanWorker();
  });

  $: currentFile = $files.find(f => f.id === $currentFileId);
  $: activeContent = currentFile ? currentFile.content : '';

  // Trigger lean worker check when content or cursor changes
  $: {
    if (activeContent !== undefined && !$isVerifying) {
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

  function startResizeExplorer() {
    isResizingExplorer = true;
  }

  function startResizeEditor() {
    isResizingEditor = true;
  }

  function doResize(event: MouseEvent) {
    if (isResizingExplorer) {
      const newWidth = (event.clientX / window.innerWidth) * 100;
      if (newWidth > 10 && newWidth < 40) {
        leftWidth = newWidth;
      }
    } else if (isResizingEditor) {
      const newWidth = ((event.clientX / window.innerWidth) * 100) - leftWidth;
      if (newWidth > 20 && newWidth < 70) {
        centerWidth = newWidth;
      }
    }
  }

  function stopResize() {
    isResizingExplorer = false;
    isResizingEditor = false;
  }

  function compileFull() {
    if (activeContent) {
      runFullVerification(activeContent);
    }
  }
</script>

<svelte:window 
  on:mousemove={doResize} 
  on:mouseup={stopResize} 
  on:mouseleave={stopResize} 
/>

<SettingsModal bind:show={showSettings} />

<main class="h-screen w-screen flex flex-row bg-cyber-darker text-cyber-text overflow-hidden" class:cursor-col-resize={isResizingExplorer || isResizingEditor}>
  
  <!-- Left Panel: File Explorer -->
  <section style="width: {leftWidth}%" class="h-full relative min-w-0">
    <FileExplorer />
  </section>

  <!-- Resizer Handle 1 -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div 
    class="w-1 cursor-col-resize bg-cyber-dark hover:bg-cyber-glow transition-colors z-10 flex-shrink-0"
    on:mousedown={startResizeExplorer}
  ></div>

  <!-- Central Panel: Editor -->
  <section style="width: {centerWidth}%" class="h-full relative flex flex-col min-w-0">
    <!-- Active File Header -->
    <div class="bg-cyber-dark px-4 py-2 text-sm font-mono border-b border-gray-800 text-cyber-accent flex justify-between items-center">
      <span>{currentFile ? currentFile.name : 'No file'}</span>
      <button 
        class="bg-cyber-accent text-cyber-darker px-3 py-1 rounded hover:bg-cyber-accentHover disabled:opacity-50 transition-colors font-bold text-xs"
        on:click={compileFull}
        disabled={$isVerifying || !currentFile}
      >
        {$isVerifying ? 'Compiling...' : 'Verify (Full WASM)'}
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

  <!-- Resizer Handle 2 -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div 
    class="w-1 cursor-col-resize bg-cyber-dark hover:bg-cyber-glow transition-colors z-10 flex-shrink-0"
    on:mousedown={startResizeEditor}
  ></div>

  <!-- Right Panel: InfoView and AI Chat -->
  <aside style="width: {100 - leftWidth - centerWidth}%" class="flex flex-col h-full bg-cyber-dark min-w-0">
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
    <section class="flex-1 overflow-hidden p-4 flex flex-col">
      <div class="flex justify-between items-center mb-2">
        <h2 class="text-cyber-accent font-bold uppercase tracking-wider text-xs">AI Co-Pilot</h2>
        <button on:click={() => showSettings = true} class="text-gray-500 hover:text-cyber-glow text-xs border border-gray-700 px-2 py-1 rounded transition-colors">⚙️ Settings</button>
      </div>
      
      <CopilotChat 
        currentCode={activeContent}
        currentTacticState={$tacticState}
      />
    </section>
  </aside>
</main>
