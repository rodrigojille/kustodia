import OpenAI from 'openai';
import dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const client = new OpenAI({
  baseURL: 'https://api.studio.nebius.com/v1/',
  apiKey: process.env.NEBIUS_API_KEY,
});

async function listModels() {
  console.log('Fetching available models from Nebius AI...');
  try {
    const list = await client.models.list();

    console.log('\n--- Available Kustodia Models ---');
    const kustodiaModels = list.data.filter(model => model.id.includes('kustodia'));

    if (kustodiaModels.length === 0) {
      console.log('No custom Kustodia models found.');
    } else {
      kustodiaModels.forEach(model => {
        console.log(model);
      });
    }
    
    console.log('---------------------------------');
    console.log('\nPlease copy the full ID of your new v4 model and provide it to me.');

  } catch (error) {
    console.error('Failed to fetch models:', error);
  }
}

listModels();
