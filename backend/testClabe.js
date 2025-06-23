const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

async function generarClabe() {
  const API_KEY = process.env.JUNO_API_KEY;
  const API_SECRET = process.env.JUNO_API_SECRET;

  const nonce = Date.now().toString();
  const httpMethod = 'POST';
  const requestPath = '/mint_platform/v1/clabes';
  const jsonPayload = '{}'; // Body vacío pero como string

  // Concatenar para la firma
  const message = nonce + httpMethod + requestPath + jsonPayload;

  // Crear la firma HMAC SHA-256 en hexadecimal
  const signature = crypto
    .createHmac('sha256', API_SECRET)
    .update(message)
    .digest('hex');

  // Construir el header de autorización
  const authHeader = `Bitso ${API_KEY}:${nonce}:${signature}`;

  try {
    const response = await axios.post(
      'https://stage.buildwithjuno.com/mint_platform/v1/clabes',
      {},
      {
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('CLABE generada:', response.data.payload.clabe);
  } catch (error) {
    if (error.response) {
      console.error('Error Juno:', error.response.data);
    } else {
      console.error(error);
    }
  }
}

generarClabe();
