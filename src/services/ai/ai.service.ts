import { Injectable, inject, signal } from '@angular/core';
import { AIProvider, AIProviderType, AIProviderConfig, AIGenerateOptions, AIMessage, DEFAULT_MODELS, PROVIDER_MODELS } from './ai-provider.interface';
import { GeminiProvider } from './gemini-provider';
import { OpenAIProvider } from './openai-provider';
import { ClaudeProvider } from './claude-provider';
import { OpenRouterProvider } from './openrouter-provider';
import { OllamaProvider } from './ollama-provider';
import { LoggingService } from '../logging.service';

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
    private loggingService = inject(LoggingService);

    private providers: Record<AIProviderType, AIProvider> = {
        'gemini': this.gemini,
        'openai': this.openai,
        'claude': this.claude,
        'openrouter': this.openrouter,
        'ollama': this.ollama,
    };

    async initialize(provider: AIProviderType = 'gemini', apiKey?: string): Promise<void> {
        this.loggingService.logUserEvent('AI Service initializing', { provider });
        
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
                this.loggingService.logUserEvent('AI Service initialized', { provider, model });
            } else {
                throw new Error(`Provider ${provider} not available`);
            }
        } catch (error) {
            console.error('[AIService] Initialization error:', error);
            this.loggingService.logSystem('AI Service init failed: ' + String(error), 'ERROR', { provider });
            throw error;
        } finally {
            this.isLoading.set(false);
        }
    }

    async generateText(prompt: string, options?: AIGenerateOptions): Promise<string> {
        console.log('[AI] generateText called, ensuring initialized...');
        await this.ensureInitialized();
        console.log('[AI] initialized, calling provider...');
        const startTime = Date.now();
        const provider = this.currentProviderType();
        const model = DEFAULT_MODELS[provider] || 'default';
        try {
            console.log('[AI] calling currentProvider.generateText...');
            const result = await this.currentProvider!.generateText(prompt, options);
            console.log('[AI] got result, logging...');
            this.loggingService.logAiPrompt(provider, model, prompt, 'success', Date.now() - startTime);
            return result;
        } catch (error) {
            console.log('[AI] error, logging...');
            this.loggingService.logAiPrompt(provider, model, prompt, 'error', Date.now() - startTime, { error: String(error) });
            console.error('[AIService] generateText failed:', error);
            throw new Error(`AI text generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async generateJSON<T = Record<string, any>>(
        prompt: string,
        schema?: any,
        options?: AIGenerateOptions
    ): Promise<T> {
        await this.ensureInitialized();
        const startTime = Date.now();
        const provider = this.currentProviderType();
        const model = DEFAULT_MODELS[provider] || 'default';
        try {
            const result = await this.currentProvider!.generateJSON(prompt, schema, options) as T;
            this.loggingService.logAiPrompt(provider, model, prompt, 'success', Date.now() - startTime);
            return result;
        } catch (error) {
            this.loggingService.logAiPrompt(provider, model, prompt, 'error', Date.now() - startTime, { error: String(error) });
            console.error('[AIService] generateJSON failed:', error);
            throw new Error(`AI JSON generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async chat(messages: AIMessage[], options?: AIGenerateOptions): Promise<string> {
        await this.ensureInitialized();
        const startTime = Date.now();
        const provider = this.currentProviderType();
        const model = DEFAULT_MODELS[provider] || 'default';
        const prompt = messages.map(m => `${m.role}: ${m.content}`).join(' | ');
        try {
            const result = await this.currentProvider!.chat(messages, options);
            this.loggingService.logAiPrompt(provider, model, prompt, 'success', Date.now() - startTime);
            return result;
        } catch (error) {
            this.loggingService.logAiPrompt(provider, model, prompt, 'error', Date.now() - startTime, { error: String(error) });
            console.error('[AIService] chat failed:', error);
            throw new Error(`AI chat failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
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
        console.log('[AI] ensureInitialized called, isInitialized:', this.isInitialized());
        if (!this.isInitialized()) {
            try {
                console.log('[AI] calling initialize...');
                await this.initialize();
                console.log('[AI] initialize done');
            } catch (error) {
                console.error('[AIService] Auto-initialization failed:', error);
                this.loggingService.logSystem('AI init failed: ' + String(error), 'ERROR');
                throw error;
            }
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
        try {
            await this.initialize(provider, apiKey);
        } catch (error) {
            console.error('[AIService] Provider switch failed:', error);
            throw error;
        }
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