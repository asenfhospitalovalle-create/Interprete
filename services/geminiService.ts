import { GoogleGenAI } from "@google/genai";
import { Chat } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

let chat: Chat | null = null;
let currentChatContext: string | null = null;

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  const base64EncodedData = await base64EncodedDataPromise;
  return {
    inlineData: {
      data: base64EncodedData,
      mimeType: file.type,
    },
  };
};

export const analyzeDocument = async (file: File, isThinkingMode: boolean): Promise<string> => {
  try {
    const modelName = isThinkingMode ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
    const config = isThinkingMode ? { thinkingConfig: { thinkingBudget: 32768 } } : {};

    const imagePart = await fileToGenerativePart(file);
    const textPart = {
      text: `Eres un experto en derecho chileno. Analiza el siguiente documento legal (dictamen, pronunciamiento, fallo, etc.) y explica su significado, conclusiones e implicaciones en un lenguaje sencillo y fácil de entender para alguien que no es abogado. Estructura tu respuesta de forma clara, utilizando títulos y viñetas si es necesario.`,
    };

    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts: [imagePart, textPart] },
      config,
    });
    
    return response.text;
  } catch (error) {
    console.error("Error analyzing document:", error);
    if (error instanceof Error) {
        return `Error al analizar el documento: ${error.message}`;
    }
    return "Ocurrió un error desconocido al analizar el documento.";
  }
};

export const getChatResponse = async (newMessage: string, documentContext: string | null): Promise<string> => {
  try {
    // Si el contexto del documento ha cambiado, reiniciamos el chat.
    if (documentContext !== currentChatContext) {
      chat = null;
      currentChatContext = documentContext;
    }

    if (!chat) {
        const systemInstruction = documentContext
            ? `Eres un experto en derecho chileno. Un usuario ha subido un documento y tú has proporcionado el siguiente análisis. Responde las preguntas del usuario basándote en este contexto. Si para responder de forma completa necesitas información adicional, como leyes, decretos o jurisprudencia chilena, utiliza la herramienta de búsqueda para encontrarla. Al final de tu respuesta, cita siempre las fuentes que utilizaste. Proporciona una respuesta completa pero condensada. El contexto del documento es:\n\n---\n${documentContext}\n---`
            : "Eres un asistente virtual amigable y servicial para la aplicación Interprete AI. Responde preguntas generales sobre la aplicación o sobre temas legales chilenos de forma concisa y clara. No des consejos legales específicos.";
        
        const config: any = { systemInstruction };
        if (documentContext) {
            config.tools = [{ googleSearch: {} }];
        }

        chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config,
        });
    }

    const response = await chat.sendMessage({ message: newMessage });
    let responseText = response.text;
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

    if (groundingChunks) {
        const uniqueSources = new Map<string, string>();
        groundingChunks.forEach((chunk: any) => {
            if (chunk.web && chunk.web.uri && chunk.web.title) {
                uniqueSources.set(chunk.web.uri, chunk.web.title);
            }
        });

        if (uniqueSources.size > 0) {
            let sourcesText = '\n\n**Fuentes:**\n';
            uniqueSources.forEach((title, uri) => {
                sourcesText += `* [${title}](${uri})\n`;
            });
            responseText += sourcesText;
        }
    }

    return responseText;

  } catch (error) {
    console.error("Error in chat:", error);
    if (error instanceof Error) {
        return `Error en el chat: ${error.message}`;
    }
    return "Ocurrió un error desconocido en el chat.";
  }
};