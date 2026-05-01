import { Injectable } from '@angular/core';
import { AIProvider, AIProviderConfig, AIGenerateOptions, AIMessage } from './ai-provider.interface';

@Injectable({ providedIn: 'root' })
export class OpenRouterProvider implements AIProvider {
    readonly providerName = 'openrouter';
    readonly defaultModel = 'google/gemini-2.0-flash-exp';

    private apiKey: string = '';
    private baseUrl = 'https://openrouter.ai/api/v1';

    async initialize(config: AIProviderConfig): Promise<void> {
        this.apiKey = config.apiKey;
    }

    async generateText(prompt: string, options?: AIGenerateOptions): Promise<string> {
        const model = options?.model || this.defaultModel;
        const response = await fetch(this.baseUrl + '/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
                'HTTP-Referer': 'https://hote-exception.com',
                'X-Title': 'HoteException'
            },
            body: JSON.stringify({
                model: model,
                messages: [{ role: 'user', content: prompt }],
                temperature: options?.temperature ?? 0.7,
                max_tokens: options?.maxTokens ?? 4096
            })
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            console.error('[OpenRouterProvider] HTTP error:', response.status, errorText);
            throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content || '';
    }

    async generateJSON<T = Record<string, any>>(
        prompt: string,
        schema?: any,
        options?: AIGenerateOptions
    ): Promise<T> {
        const jsonPrompt = schema
            ? `${prompt}\n\nRespond ONLY with valid JSON matching this schema: ${JSON.stringify(schema)}`
            : `${prompt}\n\nRespond ONLY with valid JSON.`;

        const model = options?.model || this.defaultModel;
        const response = await fetch(this.baseUrl + '/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
                'HTTP-Referer': 'https://hote-exception.com',
                'X-Title': 'HoteException'
            },
            body: JSON.stringify({
                model: model,
                messages: [{ role: 'user', content: jsonPrompt }],
                temperature: options?.temperature ?? 0.3,
                max_tokens: options?.maxTokens ?? 4096
            })
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            console.error('[OpenRouterProvider] HTTP error:', response.status, errorText);
            throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '{}';

        try {
            return JSON.parse(content) as T;
        } catch (e) {
            console.error('[OpenRouterProvider] JSON parse error:', e);
            throw new Error('Invalid JSON response from OpenRouter');
        }
    }

    async chat(messages: AIMessage[], options?: AIGenerateOptions): Promise<string> {
        const model = options?.model || this.defaultModel;
        const response = await fetch(this.baseUrl + '/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
                'HTTP-Referer': 'https://hote-exception.com',
                'X-Title': 'HoteException'
            },
            body: JSON.stringify({
                model: model,
                messages: messages.map(m => ({ role: m.role, content: m.content })),
                temperature: options?.temperature ?? 0.7,
                max_tokens: options?.maxTokens ?? 4096
            })
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            console.error('[OpenRouterProvider] HTTP error:', response.status, errorText);
            throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content || '';
    }
}