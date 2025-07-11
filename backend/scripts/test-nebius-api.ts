import OpenAI from 'openai';
import dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const client = new OpenAI({
  baseURL: 'https://api.studio.nebius.com/v1/',
  apiKey: process.env.NEBIUS_API_KEY,
});

async function testNebiusAPI() {
  console.log('🔑 Testing Nebius API authentication...');
  console.log('API Key present:', !!process.env.NEBIUS_API_KEY);
  console.log('API Key length:', process.env.NEBIUS_API_KEY?.length || 0);
  
  try {
    // First, try to list available models
    console.log('\n📋 Attempting to list models...');
    const models = await client.models.list();
    console.log('✅ Successfully connected to Nebius API');
    console.log('Available models:', models.data.map(m => m.id).slice(0, 5));
    
    // Then try a simple chat completion
    console.log('\n💬 Testing chat completion...');
    const completion = await client.chat.completions.create({
      model: 'meta-llama/Llama-3.3-70B-Instruct-LoRa:kustodia-expert-v5-ZrCs',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Hello, can you respond with just "API working"?' },
      ],
      max_tokens: 10,
      temperature: 0.1,
    });
    
    console.log('✅ Chat completion successful');
    console.log('Response:', completion.choices[0]?.message?.content);
    
  } catch (error: any) {
    console.error('❌ Error testing Nebius API:', error.message);
    console.error('Status:', error.status);
    console.error('Headers:', error.headers);
    
    if (error.status === 401) {
      console.log('\n🔧 Troubleshooting suggestions:');
      console.log('1. Check if your API key is still valid');
      console.log('2. Verify the API key format is correct');
      console.log('3. Check if the model name is correct');
      console.log('4. Try regenerating your API key from Nebius Studio');
    }
  }
}

testNebiusAPI();
