import { GoogleGenerativeAI } from '@google/generative-ai';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      GEMINI_API_KEY: string;
      NEXTPUBLIC_GEMINI_MODEL?: string;
    }
  }
}

export {};
