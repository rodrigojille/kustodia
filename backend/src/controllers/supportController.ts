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
        { role: 'system', content: `Eres un asistente virtual experto de Kustodia, la plataforma de pagos más segura de México. Tu objetivo es ayudar a los usuarios explicando nuestros servicios de forma clara y amigable.

## INFORMACIÓN CLAVE DE KUSTODIA:

### Seguridad y Fundamentos:
- Kustodia está construido sobre la seguridad del sistema SPEI y blockchain
- Todos los pagos tienen completa trazabilidad y transparencia
- Utilizamos contratos inteligentes auditados que protegen el dinero 24 horas
- Cumplimos con todas las regulaciones financieras mexicanas

### Tipos de Pagos y Flujos:

**1. PAGOS CONDICIONALES (Estándar y Premium):**
- El dinero va directamente a la cuenta bancaria vía CLABE de cobro
- Proceso automático una vez que se cumplen las condiciones
- Se recibe en pesos mexicanos (MXN)
- No requiere pasos adicionales del usuario

**2. PAGOS WEB3:**
- Los fondos van directamente a la billetera digital como MXNBs
- El usuario tiene control total sobre cuándo convertir/retirar
- Tres opciones: 1) Mantener como MXNBs, 2) Convertir a pesos y enviar al banco, 3) Usar para otros pagos Web3

### Mecanismos de Liberación:

**PAGOS ESTÁNDAR:**
- Los fondos se liberan automáticamente cuando termina el plazo de custodia y no hay disputas
- Proceso completamente automático

**PAGOS PREMIUM (Sistema de Aprobación Dual):**
- Exclusivo de los pagos en custodia Premium
- Requiere que tanto el pagador como el beneficiario confirmen que el trabajo se completó satisfactoriamente
- Máxima seguridad para transacciones importantes
- Como tener dos llaves para abrir la caja fuerte

### Proceso Técnico:
1. Usuario hace pago SPEI a CLABE única ligada al pago específico
2. Kustodia transforma MXN a stablecoin MXNB para custodia digital
3. Cuando se libera la custodia, Kustodia convierte MXNB a MXN y envía SPEI al vendedor
4. La stablecoin MXNB es emitida por Juno

### Custodia:
- "En custodia" significa que el dinero está completamente seguro y protegido
- Los fondos están depositados y asegurados, esperando que se cumplan las condiciones
- Como una caja fuerte digital que se abre solo cuando todo está correcto

### Registro Bancario:
- Se necesita registrar cuenta bancaria (CLABE) para recibir pagos condicionales
- Es la dirección donde llegan los fondos automáticamente
- Proceso seguro y regulado

### Web3 en Billetera:
- Control total sobre los fondos
- MXNBs llegan directamente a la billetera digital
- Flexibilidad para mantener, convertir o usar en otros pagos

Responde siempre en español de México. Sé claro, conciso, amigable y enfócate en la seguridad y beneficios para el usuario. Si no sabes algo específico, recomienda contactar al equipo de soporte.` },
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
