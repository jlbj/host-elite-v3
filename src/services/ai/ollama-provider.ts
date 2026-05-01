import { Injectable } from '@angular/core';
import { AIProvider, AIProviderConfig, AIGenerateOptions, AIMessage } from './ai-provider.interface';

@Injectable({ providedIn: 'root' })
export class OllamaProvider implements AIProvider {
    readonly providerName = 'ollama';
    readonly defaultModel = 'llama3.3';

    private baseUrl = 'http://localhost:11434';

    async initialize(config: AIProviderConfig): Promise<void> {
        this.baseUrl = config.baseUrl || 'http://localhost:11434';
    }

    async generateText(prompt: string, options?: AIGenerateOptions): Promise<string> {
        try {
            const model = options?.model || this.defaultModel;
            const response = await fetch(this.baseUrl + '/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: model,
                    prompt: prompt,
                    temperature: options?.temperature ?? 0.7,
                    stream: false
                })
            });

            if (!response.ok) {
                throw new Error(`Ollama error: ${response.status}`);
            }

            const data = await response.json();
            return data.response || '';
        } catch (e) {
            console.error('[OllamaProvider] Error:', e);
            throw new Error('Ollama not available. Make sure Ollama is running locally.');
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

        const responseText = await this.generateText(jsonPrompt, { ...options, temperature: 0.3 });

        try {
            const cleaned = this.cleanJson(responseText);
            return JSON.parse(cleaned) as T;
        } catch (e) {
            console.error('[OllamaProvider] JSON parse error:', e);
            throw new Error('Invalid JSON response from Ollama');
        }
    }

    async chat(messages: AIMessage[], options?: AIGenerateOptions): Promise<string> {
        const ollamaMessages = messages.map(m => ({ role: m.role, content: m.content }));
        const model = options?.model || this.defaultModel;

        const response = await fetch(this.baseUrl + '/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: model,
                messages: ollamaMessages,
                temperature: options?.temperature ?? 0.7,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(`Ollama chat error: ${response.status}`);
        }

        const data = await response.json();
        return data.message?.content || '';
    }

    private cleanJson(text: string): string {
        let cleaned = text.trim();
        if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
        else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
        if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
        return cleaned.trim();
    }

    async checkConnection(): Promise<boolean> {
        try {
            const response = await fetch(this.baseUrl + '/api/tags', { method: 'GET' });
            return response.ok;
        } catch {
            return false;
        }
    }
}