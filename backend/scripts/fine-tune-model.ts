import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const client = new OpenAI({
  baseURL: 'https://api.studio.nebius.com/v1/',
  apiKey: process.env.NEBIUS_API_KEY,
});

async function main() {
  const trainingFileName = 'kustodia-training.jsonl';
  const trainingFilePath = path.resolve(__dirname, trainingFileName);

  if (!fs.existsSync(trainingFilePath)) {
    console.error(`Error: Training file not found at ${trainingFilePath}`);
    console.error('Please create the kustodia-training.jsonl file in the scripts directory.');
    return;
  }

  try {
    console.log(`Uploading training file: ${trainingFileName}...`);
    const trainingFile = await client.files.create({
      file: fs.createReadStream(trainingFilePath),
      purpose: 'fine-tune',
    });
    console.log(`Training file uploaded successfully. File ID: ${trainingFile.id}`);

    console.log('Starting fine-tuning job...');
    const job = await client.fineTuning.jobs.create({
      training_file: trainingFile.id,
      model: 'meta-llama/Meta-Llama-3.1-70B-Instruct', // The base model to fine-tune
      suffix: 'kustodia-expert', // A custom name for your new model
    });

    console.log(`Fine-tuning job started successfully. Job ID: ${job.id}`);
    console.log('You can monitor the job status in the Nebius AI Studio.');

  } catch (error) {
    console.error('An error occurred during the fine-tuning process:', error);
  }
}

main();
