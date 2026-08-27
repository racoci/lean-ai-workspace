<script lang="ts">
  import { settings } from './stores/settings';
  import { askCopilot, type ChatMessage } from './utils/llm';

  export let currentCode = '';
  export let currentTacticState = '';

  let promptText = '';
  let chatHistory: ChatMessage[] = [];
  let isLoading = false;
  let chatContainer: HTMLDivElement;

  async function handleSend() {
    if (!promptText.trim()) return;
    
    if (!$settings.apiKey) {
      alert('Please configure your API key in settings first.');
      return;
    }

    const userMessage = promptText;
    promptText = '';
    
    chatHistory = [...chatHistory, { role: 'user', content: userMessage }];
    scrollToBottom();
    isLoading = true;

    try {
      const systemContext = `You are a Lean 4 Co-Pilot. You help users write proofs and understand the tactic state.
CURRENT EDITOR CODE:
\`\`\`lean
${currentCode}
\`\`\`

CURRENT TACTIC STATE:
\`\`\`
${currentTacticState}
\`\`\`

Provide concise, correct Lean 4 tactics or explanations. Return markdown.`;

      const responseText = await askCopilot($settings.provider, $settings.apiKey, chatHistory, systemContext);
      
      chatHistory = [...chatHistory, { role: 'assistant', content: responseText }];
    } catch (e: any) {
      chatHistory = [...chatHistory, { role: 'assistant', content: `**Error:** ${e.message}` }];
    } finally {
      isLoading = false;
      scrollToBottom();
    }
  }

  function scrollToBottom() {
    setTimeout(() => {
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 50);
  }
</script>

<div class="flex-1 overflow-y-auto mb-3 text-sm font-mono flex flex-col gap-3 pr-2" bind:this={chatContainer}>
  <div class="text-gray-400">
    > Co-Pilot initialized. Ready to assist with proofs.
  </div>
  
  {#each chatHistory as msg}
    <div class="p-2 rounded {msg.role === 'user' ? 'bg-cyber-dark text-white self-end text-right ml-4 border border-gray-700' : 'bg-transparent text-cyber-accent self-start mr-4'}">
      <span class="font-bold text-xs opacity-50 block mb-1">{msg.role === 'user' ? 'YOU' : 'AI'}</span>
      <div class="whitespace-pre-wrap">{msg.content}</div>
    </div>
  {/each}

  {#if isLoading}
    <div class="text-cyber-glow animate-pulse">Thinking...</div>
  {/if}
</div>

<div class="mt-auto flex flex-col gap-2">
  <input 
    type="text" 
    bind:value={promptText}
    on:keydown={(e) => e.key === 'Enter' && handleSend()}
    placeholder="Ask the AI for a tactic or explanation..." 
    class="w-full p-2 bg-cyber-darker border border-gray-700 rounded text-cyber-text text-sm focus:outline-none focus:border-cyber-glow font-mono transition-colors"
    disabled={isLoading}
  />
</div>
