import { Injectable, signal } from '@angular/core';
import { SupabaseService } from '../supabase.service';
import { AIProviderType, AIServiceConfig, DEFAULT_MODELS } from './ai-provider.interface';

@Injectable({ providedIn: 'root' })
export class AIConfigService {
    private config = signal<AIServiceConfig>({
        activeProvider: 'gemini',
        activeModel: DEFAULT_MODELS['gemini']
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
                        activeProvider: 'gemini',
                        activeModel: DEFAULT_MODELS['gemini']
                    });
                    return;
                }

                this.config.set({
                    activeProvider: provider,
                    activeModel: data.model || DEFAULT_MODELS[provider] || DEFAULT_MODELS['gemini'],
                    fallbackProvider: data.fallback_provider,
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
        const { data, error } = await this.supabaseService.supabase.rpc(
            'get_ai_api_key',
            { p_provider: providerToUse }
        );
        if (error) {
            console.error('[AIConfig] Error fetching API key:', error);
            return null;
        }
        return data;
    }
}