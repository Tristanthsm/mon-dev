import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export const model = genAI.getGenerativeModel({
    model: 'gemini-pro',
});

export async function* streamGeminiResponse(userMessage: string, history: any[] = []) {
    const chat = model.startChat({
        history: history,
    });

    try {
        const result = await chat.sendMessageStream(userMessage);

        for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
                yield text;
            }
        }
    } catch (error) {
        console.error('Gemini API Error:', error);
        throw new Error('Erreur lors de la requête à l\'API Gemini');
    }
}

export async function getGeminiResponse(userMessage: string, history: any[] = []) {
    const chat = model.startChat({
        history: history,
    });

    try {
        const result = await chat.sendMessage(userMessage);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Gemini API Error:', error);
        throw new Error('Erreur lors de la requête à l\'API Gemini');
    }
}
