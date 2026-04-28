export type AIProviderType = 'gemini' | 'openai' | 'claude' | 'openrouter' | 'ollama';

export interface AIProviderConfig {
    provider: AIProviderType;
    apiKey: string;
    model: string;
    baseUrl?: string;
    temperature?: number;
    maxTokens?: number;
}

export interface AIGenerateOptions {
    temperature?: number;
    maxTokens?: number;
    stopSequences?: string[];
    responseFormat?: 'text' | 'json';
}

export interface AIMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface AIProvider {
    readonly providerName: AIProviderType;
    readonly defaultModel: string;

    initialize(config: AIProviderConfig): Promise<void>;
    generateText(prompt: string, options?: AIGenerateOptions): Promise<string>;
    generateJSON<T = Record<string, any>>(prompt: string, schema?: any, options?: AIGenerateOptions): Promise<T>;
    chat(messages: AIMessage[], options?: AIGenerateOptions): Promise<string>;
}

export interface AIResponse {
    content: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
    finishReason?: 'stop' | 'length' | 'content_filter' | 'tool_calls' | 'error';
}

export interface AIServiceConfig {
    activeProvider: AIProviderType;
    activeModel: string;
    fallbackProvider?: AIProviderType;
    apiKeys?: Record<AIProviderType, string>;
}

export const PROVIDER_MODELS: Record<AIProviderType, string[]> = {
    'gemini': ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-2.5-flash', 'gemini-2.5-pro'],
    'openai': ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo', 'o1-mini', 'o1-preview'],
    'claude': ['claude-3-5-haiku-20241022', 'claude-3-5-sonnet-20241022', 'claude-3-opus-20240229'],
    'openrouter': ['google/gemini-2.0-flash-exp', 'openai/gpt-4o-mini', 'anthropic/claude-3.5-sonnet'],
    'ollama': ['llama3.3', 'llama3.1', 'mistral', 'phi4', 'qwen2.5']
};

export const DEFAULT_MODELS: Record<AIProviderType, string> = {
    'gemini': 'gemini-2.0-flash',
    'openai': 'gpt-4o-mini',
    'claude': 'claude-3-5-sonnet-20241022',
    'openrouter': 'google/gemini-2.0-flash-exp',
    'ollama': 'llama3.3'
};