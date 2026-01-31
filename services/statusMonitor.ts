import { GoogleGenAI } from "@google/genai";

export interface ServiceIssue {
    service: string;
    status: 'OPERATIONAL' | 'WARNING' | 'CRITICAL';
    description: string;
    category: string;
    time: string;
}

interface StatusCache {
    data: ServiceIssue[];
    sources: string[];
    timestamp: number;
}

const CACHE_KEY = 'fiber_status_cache_v1';
const CACHE_DURATION = 20 * 60 * 1000; // 20 minutes

export const getCachedStatus = (): StatusCache | null => {
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            const parsed = JSON.parse(cached);
            if (Date.now() - parsed.timestamp < CACHE_DURATION) {
                return parsed;
            }
        }
    } catch (e) {
        return null;
    }
    return null;
};

export const checkRealConnectivity = async (): Promise<boolean> => {
    try {
        // Fast ping to a reliable endpoint
        const response = await fetch('https://www.google.com/favicon.ico', { mode: 'no-cors', cache: 'no-store' });
        return true;
    } catch (e) {
        return false;
    }
};

export const updateStatusInBackground = async (force = false): Promise<StatusCache | null> => {
    const cached = getCachedStatus();
    if (cached && !force) return cached;

    if (!process.env.API_KEY) return null;

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: "Verifique instabilidades reais em serviços populares no Brasil hoje (WhatsApp, Instagram, Netflix, Bancos, Jogos). Liste apenas problemas confirmados nas últimas 2 horas.",
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        // Mocking structured output for the example - in production, use JSON schema
        const services: ServiceIssue[] = [
            { service: 'WhatsApp', status: 'OPERATIONAL', description: 'Serviço estável.', category: 'Social', time: 'Agora' },
            { service: 'Instagram', status: 'OPERATIONAL', description: 'Serviço estável.', category: 'Social', time: 'Agora' },
            { service: 'Netflix', status: 'OPERATIONAL', description: 'Streaming funcionando normalmente.', category: 'Entretenimento', time: 'Agora' },
            { service: 'Nubank', status: 'OPERATIONAL', description: 'App operando normalmente.', category: 'Finanças', time: 'Agora' },
        ];

        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((c: any) => c.web?.uri).filter(Boolean) || [];

        const newCache: StatusCache = {
            data: services,
            sources: sources,
            timestamp: Date.now()
        };

        localStorage.setItem(CACHE_KEY, JSON.stringify(newCache));
        return newCache;

    } catch (error) {
        console.error("Erro ao monitorar status via IA:", error);
        return null;
    }
};