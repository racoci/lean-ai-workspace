<script lang="ts">
  import { settings, saveSettings } from './stores/settings';
  import { telemetry } from './stores/telemetry';

  export let show = false;

  let provider: 'gemini' | 'openai' = 'gemini';
  let apiKey = '';

  $: if (show) {
    provider = $settings.provider;
    apiKey = $settings.apiKey;
  }

  function handleSave() {
    saveSettings({ provider, apiKey });
    show = false;
  }

  function handleClose() {
    show = false;
  }
</script>

{#if show}
<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
  <div class="bg-cyber-darker border border-cyber-glow rounded-lg w-full max-w-md p-6 shadow-2xl flex flex-col gap-4">
    <h2 class="text-xl font-bold text-cyber-glow border-b border-gray-700 pb-2">AI Provider Settings (BYOK)</h2>
    
    <div class="flex flex-col gap-2">
      <label for="provider-select" class="text-sm text-gray-400 uppercase tracking-wider">Provider</label>
      <select id="provider-select" bind:value={provider} class="p-2 bg-cyber-dark border border-gray-700 rounded text-cyber-text focus:border-cyber-accent outline-none">
        <option value="gemini">Google Gemini</option>
        <option value="openai">OpenAI</option>
      </select>
    </div>

    <div class="flex flex-col gap-2">
      <label for="api-key-input" class="text-sm text-gray-400 uppercase tracking-wider">API Key</label>
      <input id="api-key-input" type="password" bind:value={apiKey} placeholder="Enter your API Key..." class="p-2 bg-cyber-dark border border-gray-700 rounded text-cyber-text focus:border-cyber-accent outline-none" />
      <p class="text-xs text-gray-500">Your key is stored securely in your browser's IndexedDB and is never sent to our servers.</p>
    </div>

    <div class="mt-4 border-t border-gray-700 pt-4">
      <h3 class="text-sm font-bold text-cyber-accent mb-2">Telemetry Quotas</h3>
      <div class="text-xs text-gray-400 grid grid-cols-2 gap-2">
        <div class="bg-cyber-dark p-2 rounded">
          <span class="block text-gray-500">Total Tokens</span>
          <span class="text-white text-lg">{$telemetry.totalTokens}</span>
        </div>
        <div class="bg-cyber-dark p-2 rounded">
          <span class="block text-gray-500">Total Requests</span>
          <span class="text-white text-lg">{$telemetry.requests}</span>
        </div>
      </div>
    </div>

    <div class="flex justify-end gap-2 mt-4">
      <button on:click={handleClose} class="px-4 py-2 rounded text-gray-400 hover:text-white transition-colors">Cancel</button>
      <button on:click={handleSave} class="px-4 py-2 bg-cyber-accent hover:bg-cyber-accentHover text-cyber-darker font-bold rounded transition-colors">Save Settings</button>
    </div>
  </div>
</div>
{/if}
