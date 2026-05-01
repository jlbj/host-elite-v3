import { Injectable, inject, signal } from '@angular/core';
import { AIProvider, AIProviderType, AIProviderConfig, AIGenerateOptions, AIMessage, DEFAULT_MODELS, PROVIDER_MODELS } from './ai-provider.interface';
import { GeminiProvider } from './gemini-provider';
import { OpenAIProvider } from './openai-provider';
import { ClaudeProvider } from './claude-provider';
import { OpenRouterProvider } from './openrouter-provider';
import { OllamaProvider } from './ollama-provider';

export type { AIProvider, AIProviderType, AIProviderConfig, AIGenerateOptions, AIMessage };
export { DEFAULT_MODELS, PROVIDER_MODELS };

@Injectable({ providedIn: 'root' })
export class AIService {
    private currentProvider: AIProvider | null = null;
    private currentProviderType = signal<AIProviderType>('gemini');
    private isInitialized = signal(false);
    private isLoading = signal(false);

    private gemini = inject(GeminiProvider);
    private openai = inject(OpenAIProvider);
    private claude = inject(ClaudeProvider);
    private openrouter = inject(OpenRouterProvider);
    private ollama = inject(OllamaProvider);

    private providers: Record<AIProviderType, AIProvider> = {
        'gemini': this.gemini,
        'openai': this.openai,
        'claude': this.claude,
        'openrouter': this.openrouter,
        'ollama': this.ollama,
    };

    async initialize(provider: AIProviderType = 'gemini', apiKey?: string): Promise<void> {
        if (this.isInitialized() && this.currentProviderType() === provider) {
            return;
        }

        this.isLoading.set(true);
        try {
            const model = DEFAULT_MODELS[provider];
            const config: AIProviderConfig = {
                provider,
                apiKey: apiKey || '',
                model,
                temperature: 0.7,
                maxTokens: 4096
            };

            const providerInstance = this.providers[provider];
            if (providerInstance) {
                await providerInstance.initialize(config);
                this.currentProvider = providerInstance;
                this.currentProviderType.set(provider);
                this.isInitialized.set(true);
                console.log(`[AIService] Initialized with ${provider}`);
            } else {
                throw new Error(`Provider ${provider} not available`);
            }
        } catch (error) {
            console.error('[AIService] Initialization error:', error);
            throw error;
        } finally {
            this.isLoading.set(false);
        }
    }

    async generateText(prompt: string, options?: AIGenerateOptions): Promise<string> {
        await this.ensureInitialized();
        return this.currentProvider!.generateText(prompt, options);
    }

    async generateJSON<T = Record<string, any>>(
        prompt: string,
        schema?: any,
        options?: AIGenerateOptions
    ): Promise<T> {
        await this.ensureInitialized();
        return this.currentProvider!.generateJSON(prompt, schema, options);
    }

    async chat(messages: AIMessage[], options?: AIGenerateOptions): Promise<string> {
        await this.ensureInitialized();
        return this.currentProvider!.chat(messages, options);
    }

    get providerType(): AIProviderType {
        return this.currentProviderType();
    }

    get availableProviders(): AIProviderType[] {
        return Object.keys(this.providers) as AIProviderType[];
    }

    get availableModels(): string[] {
        return PROVIDER_MODELS[this.currentProviderType()] || [];
    }

    private async ensureInitialized(): Promise<void> {
        if (!this.isInitialized()) {
            await this.initialize();
        }
    }

    async testConnection(provider: AIProviderType, apiKey: string): Promise<boolean> {
        try {
            const providerInstance = this.providers[provider];
            if (!providerInstance) return false;

            await providerInstance.initialize({
                provider,
                apiKey,
                model: DEFAULT_MODELS[provider]
            });

            const testPrompt = 'Say "OK" if you receive this message.';
            await providerInstance.generateText(testPrompt, { temperature: 0.1, maxTokens: 10 });
            return true;
        } catch (e) {
            console.error('[AIService] Connection test failed:', e);
            return false;
        }
    }

    async switchProvider(provider: AIProviderType, apiKey?: string): Promise<void> {
        this.isInitialized.set(false);
        await this.initialize(provider, apiKey);
    }

    getAvailableModels(provider: AIProviderType): string[] {
        return PROVIDER_MODELS[provider] || [];
    }

    async getModels(provider: AIProviderType): Promise<string[]> {
        if (provider === 'ollama') {
            try {
                const response = await fetch('http://localhost:11434/api/tags');
                const data = await response.json();
                return data.models?.map((m: any) => m.name) || [];
            } catch {
                return PROVIDER_MODELS['ollama'];
            }
        }
        return PROVIDER_MODELS[provider] || [];
    }
}