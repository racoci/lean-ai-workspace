<script lang="ts">
  let editorContainer: HTMLDivElement;
</script>

<main class="h-screen w-screen flex flex-row bg-cyber-darker text-cyber-text">
  <!-- Central Panel: Editor -->
  <section class="flex-1 border-r border-cyber-dark relative">
    <div class="h-full w-full absolute inset-0" bind:this={editorContainer}>
      <!-- Editor will be injected here -->
      <div class="p-4 text-cyber-accent">Initializing Editor...</div>
    </div>
  </section>

  <!-- Right Panel: InfoView and AI Chat -->
  <aside class="w-1/3 min-w-[300px] flex flex-col h-full bg-cyber-dark">
    <!-- Top Right: InfoView -->
    <section class="flex-1 border-b border-cyber-darker overflow-auto p-4">
      <h2 class="text-cyber-glow font-bold mb-2">InfoView (Tactic State)</h2>
      <div class="text-sm">
        ⊢ Goals will appear here
      </div>
    </section>

    <!-- Bottom Right: AI Co-Pilot Chat -->
    <section class="flex-1 overflow-auto p-4 flex flex-col">
      <h2 class="text-cyber-accent font-bold mb-2">AI Co-Pilot</h2>
      <div class="flex-1 overflow-y-auto mb-2 text-sm text-gray-300">
        Chat history...
      </div>
      <div class="mt-auto">
        <input 
          type="text" 
          placeholder="Ask the AI..." 
          class="w-full p-2 bg-cyber-darker border border-gray-700 rounded text-cyber-text focus:outline-none focus:border-cyber-glow"
        />
      </div>
    </section>
  </aside>
</main>
