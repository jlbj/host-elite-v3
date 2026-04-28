import { Injectable } from '@angular/core';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIProvider, AIProviderConfig, AIGenerateOptions, AIMessage, AIResponse } from './ai-provider.interface';

@Injectable({ providedIn: 'root' })
export class GeminiProvider implements AIProvider {
    readonly providerName = 'gemini';
    readonly defaultModel = 'gemini-2.0-flash';

    private genAI: GoogleGenerativeAI | null = null;
    private model: any = null;

    async initialize(config: AIProviderConfig): Promise<void> {
        this.genAI = new GoogleGenerativeAI(config.apiKey);
        this.model = this.genAI.getGenerativeModel({ model: config.model || this.defaultModel });
    }

    async generateText(prompt: string, options?: AIGenerateOptions): Promise<string> {
        if (!this.model) throw new Error('GeminiProvider not initialized');

        const generationConfig: any = {
            temperature: options?.temperature ?? 0.7,
            maxOutputTokens: options?.maxTokens ?? 2048,
        };

        if (options?.responseFormat === 'json') {
            generationConfig.responseMimeType = 'application/json';
        }

        const result = await this.model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig
        });

        const response = result.response;
        return response.text();
    }

    async generateJSON<T = Record<string, any>>(
        prompt: string,
        schema?: any,
        options?: AIGenerateOptions
    ): Promise<T> {
        const jsonPrompt = schema
            ? `${prompt}\n\nRespond ONLY with valid JSON matching this schema: ${JSON.stringify(schema)}`
            : `${prompt}\n\nRespond ONLY with valid JSON.`;

        const result = await this.generateText(jsonPrompt, { ...options, responseFormat: 'json' });

        try {
            const cleaned = this.cleanJson(result);
            return JSON.parse(cleaned) as T;
        } catch (e) {
            console.error('[GeminiProvider] JSON parse error:', e);
            throw new Error('Invalid JSON response from AI');
        }
    }

    async chat(messages: AIMessage[], options?: AIGenerateOptions): Promise<string> {
        if (!this.model) throw new Error('GeminiProvider not initialized');

        const history = messages.slice(0, -1).map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
        }));

        const lastMessage = messages[messages.length - 1].content;

        const chat = this.model.startChat({
            history,
            generationConfig: {
                temperature: options?.temperature ?? 0.7,
                maxOutputTokens: options?.maxTokens ?? 2048,
            }
        });

        const result = await chat.sendMessage(lastMessage);
        return result.response.text();
    }

    private cleanJson(text: string): string {
        let cleaned = text.trim();
        if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
        else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
        if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
        if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
        return cleaned.trim();
    }
}