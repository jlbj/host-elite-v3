import { Injectable } from '@angular/core';
import Anthropic from '@anthropic-ai/sdk';
import { AIProvider, AIProviderConfig, AIGenerateOptions, AIMessage, AIResponse } from './ai-provider.interface';

@Injectable({ providedIn: 'root' })
export class ClaudeProvider implements AIProvider {
    readonly providerName = 'claude';
    readonly defaultModel = 'claude-3-5-sonnet-20241022';

    private client: Anthropic | null = null;

    async initialize(config: AIProviderConfig): Promise<void> {
        this.client = new Anthropic({
            apiKey: config.apiKey,
            baseURL: config.baseUrl
        });
    }

    async generateText(prompt: string, options?: AIGenerateOptions): Promise<string> {
        if (!this.client) throw new Error('ClaudeProvider not initialized');

        const response = await this.client.messages.create({
            model: options?.model || this.defaultModel,
            max_tokens: options?.maxTokens ?? 4096,
            temperature: options?.temperature ?? 0.7,
            messages: [{ role: 'user' as const, content: prompt }]
        });

        return response.content[0].type === 'text' ? response.content[0].text : '';
    }

    async generateJSON<T = Record<string, any>>(
        prompt: string,
        schema?: any,
        options?: AIGenerateOptions
    ): Promise<T> {
        const jsonPrompt = schema
            ? `${prompt}\n\nRespond ONLY with valid JSON matching this schema: ${JSON.stringify(schema)}`
            : `${prompt}\n\nRespond ONLY with valid JSON.`;

        const response = await this.client!.messages.create({
            model: options?.model || this.defaultModel,
            max_tokens: options?.maxTokens ?? 4096,
            temperature: options?.temperature ?? 0.3,
            messages: [{ role: 'user' as const, content: jsonPrompt }]
        });

        const content = response.content[0].type === 'text' ? response.content[0].text : '{}';

        try {
            const cleaned = this.cleanJson(content);
            return JSON.parse(cleaned) as T;
        } catch (e) {
            console.error('[ClaudeProvider] JSON parse error:', e);
            throw new Error('Invalid JSON response from Claude');
        }
    }

    async chat(messages: AIMessage[], options?: AIGenerateOptions): Promise<string> {
        if (!this.client) throw new Error('ClaudeProvider not initialized');

        const formattedMessages = messages.map(m => ({ 
            role: m.role as 'user' | 'assistant', 
            content: m.content 
        }));

        const response = await this.client.messages.create({
            model: options?.model || this.defaultModel,
            max_tokens: options?.maxTokens ?? 4096,
            temperature: options?.temperature ?? 0.7,
            messages: formattedMessages
        });

        return response.content[0].type === 'text' ? response.content[0].text : '';
    }

    private cleanJson(text: string): string {
        let cleaned = text.trim();
        if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
        else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
        if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
        return cleaned.trim();
    }
}