import { Injectable } from '@angular/core';
import Anthropic from '@anthropic-ai/sdk';
import { AIProvider, AIProviderConfig, AIGenerateOptions, AIMessage, AIResponse } from './ai-provider.interface';

@Injectable({ providedIn: 'root' })
export class ClaudeProvider implements AIProvider {
    readonly providerName = 'claude';
    readonly defaultModel = 'claude-3-5-sonnet-20241022';

    private client: Anthropic | null = null;

    async initialize(config: AIProviderConfig): Promise<void> {
        try {
            this.client = new Anthropic({
                apiKey: config.apiKey,
                baseURL: config.baseUrl
            });
        } catch (error) {
            console.error('[ClaudeProvider] Initialization failed:', error);
            throw error;
        }
    }

    async generateText(prompt: string, options?: AIGenerateOptions): Promise<string> {
        if (!this.client) throw new Error('ClaudeProvider not initialized');

        try {
            const response = await this.client.messages.create({
                model: options?.model || this.defaultModel,
                max_tokens: options?.maxTokens ?? 4096,
                temperature: options?.temperature ?? 0.7,
                messages: [{ role: 'user' as const, content: prompt }]
            });

            if (!response.content || response.content.length === 0) {
                throw new Error('Claude returned empty response');
            }

            return response.content[0].type === 'text' ? response.content[0].text : '';
        } catch (error) {
            console.error('[ClaudeProvider] generateText failed:', error);
            throw error;
        }
    }

    async generateJSON<T = Record<string, any>>(
        prompt: string,
        schema?: any,
        options?: AIGenerateOptions
    ): Promise<T> {
        const jsonPrompt = schema
            ? `${prompt}\n\nRespond ONLY with valid JSON matching this schema: ${JSON.stringify(schema)}`
            : `${prompt}\n\nRespond ONLY with valid JSON.`;

        try {
            const response = await this.client!.messages.create({
                model: options?.model || this.defaultModel,
                max_tokens: options?.maxTokens ?? 4096,
                temperature: options?.temperature ?? 0.3,
                messages: [{ role: 'user' as const, content: jsonPrompt }]
            });

            if (!response.content || response.content.length === 0) {
                throw new Error('Claude returned empty response');
            }

            const content = response.content[0].type === 'text' ? response.content[0].text : '{}';

            try {
                const cleaned = this.cleanJson(content);
                return JSON.parse(cleaned) as T;
            } catch (e) {
                console.error('[ClaudeProvider] JSON parse error:', e);
                throw new Error('Invalid JSON response from Claude');
            }
        } catch (error) {
            console.error('[ClaudeProvider] generateJSON failed:', error);
            throw error;
        }
    }

    async chat(messages: AIMessage[], options?: AIGenerateOptions): Promise<string> {
        if (!this.client) throw new Error('ClaudeProvider not initialized');

        try {
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

            if (!response.content || response.content.length === 0) {
                throw new Error('Claude returned empty response');
            }

            return response.content[0].type === 'text' ? response.content[0].text : '';
        } catch (error) {
            console.error('[ClaudeProvider] chat failed:', error);
            throw error;
        }
    }

    private cleanJson(text: string): string {
        let cleaned = text.trim();
        if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
        else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
        if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
        return cleaned.trim();
    }
}