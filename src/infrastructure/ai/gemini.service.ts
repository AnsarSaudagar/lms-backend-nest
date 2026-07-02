import { GoogleGenerativeAI } from '@google/generative-ai';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GeminiService {
    private genAI: GoogleGenerativeAI;

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('GEMINI_API_KEY');

        if (!apiKey) throw new Error('GEMINI_API_KEY is missing');

        this.genAI = new GoogleGenerativeAI(apiKey);
    }

    async main(prompt: string, retries = 3) {
        try {
            const model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (error) {
            throw error;
        }
    }
}
