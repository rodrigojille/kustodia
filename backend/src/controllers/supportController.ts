import { Request, Response } from 'express';
import OpenAI from 'openai';

// Nebius AI is compatible with the OpenAI API, so we use the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.NEBIUS_API_KEY,
  baseURL: 'https://api.studio.nebius.com/v1',
});

// Log API key status for debugging (without exposing the actual key)
console.log('Nebius API Key status:', process.env.NEBIUS_API_KEY ? 'Set' : 'Missing');

export const handleChatMessage = async (req: Request, res: Response): Promise<void> => {
  const { message } = req.body;

  if (!message) {
    res.status(400).json({ error: 'Message is required' });
    return;
  }

  try {
    // Check if API key is available
    if (!process.env.NEBIUS_API_KEY) {
      console.error('NEBIUS_API_KEY environment variable is not set');
      res.status(500).json({ error: 'AI service configuration error. Please contact support.' });
      return;
    }

    const completion = await openai.chat.completions.create({
      model: 'meta-llama/Llama-3.3-70B-Instruct-LoRa:kustodia-expert-v5-ZrCs',
      messages: [
        { role: 'system', content: 'Eres un asistente virtual experto de Kustodia. Tu objetivo es explicar el proceso de pago de forma clara. El proceso es: 1. El usuario hace un pago SPEI a una CLABE única ligada a un pago específico. 2. Kustodia transforma esos MXN a la stablecoin MXNB para crear la custodia digital. 3. Cuando la custodia se libera, Kustodia convierte los MXNB de vuelta a MXN y envía un SPEI al vendedor. El vendedor solo necesita su CLABE de banco para recibir el pago. La stablecoin MXNB es emitida por Juno. Responde siempre en español de México. Sé claro, conciso y amigable.' },
        { role: 'user', content: message },
      ],
      temperature: 0.7,
    });

    const botResponse = completion.choices[0]?.message?.content?.trim() || 'Lo siento, no pude generar una respuesta.';
    res.json({ response: botResponse });

  } catch (error: any) {
    console.error('Error calling Nebius AI:', error);
    
    // Provide more specific error messages based on the error type
    if (error.status === 401) {
      console.error('Authentication failed - API key may be invalid or expired');
      res.status(500).json({ error: 'AI service authentication error. Please contact support.' });
    } else if (error.status === 429) {
      console.error('Rate limit exceeded');
      res.status(500).json({ error: 'AI service is temporarily unavailable. Please try again later.' });
    } else {
      res.status(500).json({ error: 'Failed to get response from AI service.' });
    }
  }
};
