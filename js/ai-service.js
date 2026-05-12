import { getAISettings } from './storage.js';

const PROVIDERS = {
  deepseek: {
    name: 'DeepSeek',
    endpoint: 'https://api.deepseek.com/v1/chat/completions',
    model: 'deepseek-chat',
    keyPlaceholder: 'sk-...',
    isAnthropic: false,
  },
  qwen: {
    name: '通义千问',
    endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    model: 'qwen-turbo',
    keyPlaceholder: 'sk-...',
    isAnthropic: false,
  },
  moonshot: {
    name: 'Moonshot',
    endpoint: 'https://api.moonshot.cn/v1/chat/completions',
    model: 'moonshot-v1-8k',
    keyPlaceholder: 'sk-...',
    isAnthropic: false,
  },
  openai: {
    name: 'OpenAI',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o-mini',
    keyPlaceholder: 'sk-...',
    isAnthropic: false,
  },
  claude: {
    name: 'Claude',
    endpoint: 'https://api.anthropic.com/v1/messages',
    model: 'claude-3-5-haiku-latest',
    keyPlaceholder: 'sk-ant-...',
    isAnthropic: true,
  },
  custom: {
    name: '自定义',
    endpoint: '',
    model: '',
    keyPlaceholder: '',
    isAnthropic: false,
  },
};

export function getProviders() { return PROVIDERS; }
export function getProviderList() { return Object.entries(PROVIDERS).map(([k, v]) => ({ key: k, ...v })); }

async function callOpenAICompatible(endpoint, apiKey, model, messages, temperature = 0.9) {
  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, messages, temperature, max_tokens: 2000 }),
  });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`API 调用失败 (${resp.status}): ${err}`);
  }
  const data = await resp.json();
  return data.choices[0].message.content;
}

async function callAnthropic(endpoint, apiKey, model, messages, temperature = 0.9) {
  const systemMsg = messages.find(m => m.role === 'system')?.content || '';
  const chatMsgs = messages.filter(m => m.role !== 'system');
  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({ model, max_tokens: 2000, temperature, system: systemMsg, messages: chatMsgs }),
  });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Claude API 调用失败 (${resp.status}): ${err}`);
  }
  const data = await resp.json();
  return data.content[0].text;
}

export async function chat(messages, temperature) {
  const settings = getAISettings();
  const provider = PROVIDERS[settings.provider];
  if (!provider) throw new Error('未选择 AI 服务商');
  const apiKey = settings.apiKeys[settings.provider];
  if (!apiKey || !apiKey.trim()) throw new Error('请先在设置中配置 API Key');

  const endpoint = settings.provider === 'custom' ? settings.customEndpoint : provider.endpoint;
  const model = settings.provider === 'custom' ? settings.customModel : provider.model;

  if (!endpoint || !model) throw new Error('请完善 API 端点或模型名');

  if (provider.isAnthropic) {
    return callAnthropic(endpoint, apiKey, model, messages, temperature);
  }
  return callOpenAICompatible(endpoint, apiKey, model, messages, temperature);
}

export async function simpleChat(systemPrompt, userPrompt, temperature = 0.9) {
  return chat([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ], temperature);
}
