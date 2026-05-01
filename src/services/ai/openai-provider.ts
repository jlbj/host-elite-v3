import { Injectable } from '@angular/core';
import OpenAI from 'openai';
import { AIProvider, AIProviderConfig, AIGenerateOptions, AIMessage, AIResponse } from './ai-provider.interface';

@Injectable({ providedIn: 'root' })
export class OpenAIProvider implements AIProvider {
    readonly providerName = 'openai';
    readonly defaultModel = 'gpt-4o-mini';

    private client: OpenAI | null = null;

    async initialize(config: AIProviderConfig): Promise<void> {
        this.client = new OpenAI({
            apiKey: config.apiKey,
            baseURL: config.baseUrl
        });
    }

    async generateText(prompt: string, options?: AIGenerateOptions): Promise<string> {
        if (!this.client) throw new Error('OpenAIProvider not initialized');

        const model = options?.model || this.defaultModel;
        const response = await this.client.chat.completions.create({
            model,
            messages: [{ role: 'user', content: prompt }],
            temperature: options?.temperature ?? 0.7,
            max_tokens: options?.maxTokens ?? 2048,
        });

        return response.choices[0]?.message?.content || '';
    }

    async generateJSON<T = Record<string, any>>(
        prompt: string,
        schema?: any,
        options?: AIGenerateOptions
    ): Promise<T> {
        const jsonPrompt = schema
            ? `${prompt}\n\nRespond ONLY with valid JSON matching this schema: ${JSON.stringify(schema)}`
            : `${prompt}\n\nRespond ONLY with valid JSON.`;

        if (!this.client) throw new Error('OpenAIProvider not initialized');

        const response = await this.client.chat.completions.create({
            model: options?.model || this.defaultModel,
            messages: [{ role: 'user', content: jsonPrompt }],
            temperature: options?.temperature ?? 0.3,
            max_tokens: options?.maxTokens ?? 4096,
            response_format: { type: 'json_object' }
        });

        const content = response.choices[0]?.message?.content || '{}';

        try {
            return JSON.parse(content) as T;
        } catch (e) {
            console.error('[OpenAIProvider] JSON parse error:', e);
            throw new Error('Invalid JSON response from OpenAI');
        }
    }

    async chat(messages: AIMessage[], options?: AIGenerateOptions): Promise<string> {
        if (!this.client) throw new Error('OpenAIProvider not initialized');

        const response = await this.client.chat.completions.create({
            model: options?.model || this.defaultModel,
            messages: messages.map(m => ({ role: m.role, content: m.content })),
            temperature: options?.temperature ?? 0.7,
            max_tokens: options?.maxTokens ?? 2048
        });

        return response.choices[0]?.message?.content || '';
    }
}