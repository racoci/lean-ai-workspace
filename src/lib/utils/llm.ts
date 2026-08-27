import { logTelemetry } from '../stores/telemetry';

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export async function askCopilot(
  provider: 'gemini' | 'openai',
  apiKey: string,
  history: ChatMessage[],
  systemContext: string
): Promise<string> {
  if (!apiKey) {
    throw new Error('API Key is missing. Please configure it in settings.');
  }

  if (provider === 'gemini') {
    return askGemini(apiKey, history, systemContext);
  } else {
    return askOpenAI(apiKey, history, systemContext);
  }
}

async function askGemini(apiKey: string, history: ChatMessage[], systemContext: string): Promise<string> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  // Gemini specific formatting
  const contents = history.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  const payload = {
    system_instruction: {
      parts: [{ text: systemContext }]
    },
    contents,
    generationConfig: {
      temperature: 0.2
    }
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Gemini API Error: ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  // Estimate tokens if not provided in response metadata (approx 4 chars per token)
  const promptChars = systemContext.length + history.reduce((acc, msg) => acc + msg.content.length, 0);
  const responseChars = text.length;
  const estimatedTokens = Math.ceil((promptChars + responseChars) / 4);
  
  await logTelemetry(estimatedTokens);
  
  return text;
}

async function askOpenAI(apiKey: string, history: ChatMessage[], systemContext: string): Promise<string> {
  const endpoint = 'https://api.openai.com/v1/chat/completions';

  const messages = [
    { role: 'system', content: systemContext },
    ...history
  ];

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.2
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`OpenAI API Error: ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  
  if (data.usage && data.usage.total_tokens) {
    await logTelemetry(data.usage.total_tokens);
  }
  
  return data.choices?.[0]?.message?.content || '';
}
