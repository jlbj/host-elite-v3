import { Injectable, signal } from '@angular/core';
import { SupabaseService } from '../supabase.service';
import { AIProviderType, AIServiceConfig, DEFAULT_MODELS } from './ai-provider.interface';

@Injectable({ providedIn: 'root' })
export class AIConfigService {
    private config = signal<AIServiceConfig>({
        activeProvider: 'openai',
        activeModel: DEFAULT_MODELS['openai']
    });

    constructor(private supabaseService: SupabaseService) {}

    async initialize(): Promise<void> {
        try {
            const { data } = await this.supabaseService.supabase.rpc('get_ai_config');
            if (data) {
                const provider = data.provider as AIProviderType;
                const validProviders: AIProviderType[] = ['gemini', 'openai', 'claude', 'openrouter', 'ollama'];
                
                if (!provider || !validProviders.includes(provider)) {
                    console.warn('[AIConfig] Invalid provider from database, using default');
                    this.config.set({
                        activeProvider: 'openai',
                        activeModel: DEFAULT_MODELS['openai']
                    });
                    return;
                }

                this.config.set({
                    activeProvider: provider,
                    activeModel: data.model || DEFAULT_MODELS[provider] || DEFAULT_MODELS['gemini'],
                    fallbackProvider: data.fallback_provider || 'openai',
                    apiKeys: {} as Record<AIProviderType, string>
                });
            }
        } catch (error) {
            console.error('[AIConfig] Initialization failed:', error);
            throw error;
        }
    }

    get activeProvider(): AIProviderType {
        return this.config().activeProvider;
    }

    get activeModel(): string {
        return this.config().activeModel;
    }

    setProvider(provider: AIProviderType, model?: string): void {
        const modelToUse = model || DEFAULT_MODELS[provider];
        this.config.update(c => ({
            ...c,
            activeProvider: provider,
            activeModel: modelToUse
        }));
    }

    async setProviderAndSave(provider: AIProviderType, model?: string): Promise<void> {
        this.setProvider(provider, model);
        await this.supabaseService.supabase.rpc('set_ai_config', {
            p_provider: provider,
            p_model: model || DEFAULT_MODELS[provider]
        });
    }

async fetchApiKey(provider?: AIProviderType): Promise<string | null> {
        const providerToUse = provider || this.activeProvider;

        // First try: fetch from Supabase (production setup)
        try {
            const { data, error } = await this.supabaseService.supabase.rpc(
                'get_ai_api_key',
                { p_provider: providerToUse }
            );

            if (!error && data) {
                return data;
            }

            if (error) {
                console.warn('[AIConfig] Supabase API key fetch failed, trying fallback:', error.message);
            }
        } catch (e) {
            console.warn('[AIConfig] Supabase not available, trying fallback');
        }

        // Fallback: use environment configuration (for development/local testing)
        try {
            const { environment } = await import('@/environment');
            // Select the correct key based on provider
            const apiKey = providerToUse === 'openai' ? environment.openaiApiKey : environment.geminiApiKey;
            if (apiKey) {
                console.log(`[AIConfig] Using ${providerToUse} API key from environment configuration`);
                return apiKey;
            }
        } catch (e) {
            console.warn('[AIConfig] No environment fallback available');
        }

        return null;
    }
}