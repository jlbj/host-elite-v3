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
        const { data } = await this.supabaseService.supabase.rpc('get_ai_config');
        if (data) {
            this.config.set({
                activeProvider: (data.provider as AIProviderType) || 'gemini',
                activeModel: data.model || DEFAULT_MODELS[data.provider as AIProviderType] || DEFAULT_MODELS['gemini'],
                fallbackProvider: data.fallback_provider,
                apiKeys: {} as Record<AIProviderType, string>
            });
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