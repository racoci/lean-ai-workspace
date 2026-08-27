<script lang="ts">
  import { files, currentFileId, createNewFile, switchFile, deleteFileAndSwitch, renameFileEntry } from './stores/files';
  
  let newFileName = '';
  let isCreating = false;
  let renamingId: string | null = null;
  let renamingName = '';

  function handleCreate() {
    if (newFileName.trim()) {
      createNewFile(newFileName.trim());
      newFileName = '';
      isCreating = false;
    }
  }

  function startRename(file: any) {
    renamingId = file.id;
    renamingName = file.name;
  }

  function confirmRename() {
    if (renamingId && renamingName.trim()) {
      renameFileEntry(renamingId, renamingName.trim());
    }
    renamingId = null;
  }

  function handleDelete(id: string, e: Event) {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this file?')) {
      deleteFileAndSwitch(id);
    }
  }
</script>

<div class="h-full bg-cyber-darker border-r border-cyber-dark flex flex-col text-sm font-mono overflow-hidden">
  <div class="p-3 border-b border-cyber-dark flex justify-between items-center">
    <h3 class="text-cyber-glow font-bold uppercase text-xs tracking-wider">Explorer</h3>
    <button class="text-gray-400 hover:text-white" on:click={() => isCreating = !isCreating}>+</button>
  </div>
  
  <div class="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
    {#if isCreating}
      <div class="flex flex-col gap-1 p-1 bg-cyber-dark rounded">
        <input 
          type="text" 
          bind:value={newFileName} 
          placeholder="Filename.lean" 
          class="bg-cyber-darker border border-gray-700 text-white px-2 py-1 outline-none focus:border-cyber-accent"
          on:keydown={(e) => e.key === 'Enter' && handleCreate()}
        />
        <div class="flex justify-end gap-2 mt-1">
          <button class="text-gray-500 text-xs hover:text-white" on:click={() => isCreating = false}>Cancel</button>
          <button class="text-cyber-accent text-xs hover:text-white" on:click={handleCreate}>Create</button>
        </div>
      </div>
    {/if}

    {#each $files as file}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <div 
        class="flex justify-between items-center px-2 py-1 rounded cursor-pointer group {file.id === $currentFileId ? 'bg-cyber-dark text-cyber-accent border-l-2 border-cyber-accent' : 'text-gray-400 hover:bg-gray-800 hover:text-white border-l-2 border-transparent'}"
        on:click={() => switchFile(file.id)}
      >
        {#if renamingId === file.id}
          <input 
            type="text" 
            bind:value={renamingName} 
            class="bg-cyber-darker text-white outline-none w-full px-1 mr-2"
            on:keydown={(e) => e.key === 'Enter' && confirmRename()}
            on:blur={confirmRename}
            on:click|stopPropagation
            autofocus
          />
        {:else}
          <span class="truncate mr-2">{file.name}</span>
          <div class="hidden group-hover:flex gap-2">
            <button class="text-gray-500 hover:text-white" title="Rename" on:click|stopPropagation={() => startRename(file)}>✎</button>
            {#if $files.length > 1}
              <button class="text-gray-500 hover:text-red-500" title="Delete" on:click={(e) => handleDelete(file.id, e)}>✕</button>
            {/if}
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>
