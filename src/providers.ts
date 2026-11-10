// Liste des fournisseurs d'IA proposés dans la fenêtre de réglages.
// Fichier partagé client/serveur : il ne contient aucune clé.

export const PROVIDERS = {
  openrouter: {
    nom: 'OpenRouter',
    envVar: 'OPENROUTER_API_KEY',
    urlCle: 'https://openrouter.ai/settings/keys',
    modeles: [
      { id: 'openrouter/free', nom: 'Gratuit (choisi par OpenRouter)' },
      { id: 'anthropic/claude-sonnet-5.5', nom: 'Claude Sonnet 5.5' },
      { id: 'openai/gpt-5.5', nom: 'GPT-5.5' },
      { id: 'google/gemini-3.5-flash', nom: 'Gemini 3.5 Flash' },
      { id: 'mistralai/mistral-large', nom: 'Mistral Large' },
      { id: 'x-ai/grok-4.7', nom: 'Grok 4.7' },
      { id: 'deepseek/deepseek-v4-flash', nom: 'DeepSeek V4 Flash' },
    ],
  },
  openai: {
    nom: 'OpenAI',
    envVar: 'OPENAI_API_KEY',
    urlCle: 'https://platform.openai.com/api-keys',
    modeles: [
      { id: 'gpt-5.5', nom: 'GPT-5.5' },
      { id: 'gpt-5.4-mini', nom: 'GPT-5.4 mini' },
      { id: 'gpt-5.4-nano', nom: 'GPT-5.4 nano' },
    ],
  },
  anthropic: {
    nom: 'Anthropic',
    envVar: 'ANTHROPIC_API_KEY',
    urlCle: 'https://console.anthropic.com/settings/keys',
    modeles: [
      { id: 'claude-sonnet-5-5', nom: 'Claude Sonnet 5.5' },
      { id: 'claude-haiku-5-5', nom: 'Claude Haiku 5.5' },
      { id: 'claude-opus-5-5', nom: 'Claude Opus 5.5' },
    ],
  },
  gemini: {
    nom: 'Google Gemini',
    envVar: 'GEMINI_API_KEY',
    urlCle: 'https://aistudio.google.com/apikey',
    modeles: [
      { id: 'gemini-3.5-flash', nom: 'Gemini 3.5 Flash' },
      { id: 'gemini-3.5-flash-lite', nom: 'Gemini 3.5 Flash Lite' },
      { id: 'gemini-3.1-pro-preview', nom: 'Gemini 3.1 Pro (preview)' },
    ],
  },
  mistral: {
    nom: 'Mistral AI',
    envVar: 'MISTRAL_API_KEY',
    urlCle: 'https://console.mistral.ai/api-keys',
    modeles: [
      { id: 'mistral-large-latest', nom: 'Mistral Large' },
      { id: 'mistral-medium-latest', nom: 'Mistral Medium' },
      { id: 'mistral-small-latest', nom: 'Mistral Small' },
    ],
  },
  grok: {
    nom: 'xAI Grok',
    envVar: 'XAI_API_KEY',
    urlCle: 'https://console.x.ai',
    modeles: [
      { id: 'grok-4.7', nom: 'Grok 4.7' },
      { id: 'grok-4.5', nom: 'Grok 4.5' },
    ],
  },
} as const

export type ProviderId = keyof typeof PROVIDERS

export const PROVIDER_IDS = Object.keys(PROVIDERS) as ProviderId[]

export const PROVIDER_PAR_DEFAUT: ProviderId = 'openrouter'

export function modeleParDefaut(provider: ProviderId): string {
  return PROVIDERS[provider].modeles[0].id
}
