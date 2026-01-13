import { InferenceClient } from '@huggingface/inference';

const apiKey = process.env.HUGGINGFACE_API_KEY;

if (!apiKey || apiKey === 'hf_your_token_here') {
  console.warn("Missing HUGGINGFACE_API_KEY environment variable. AI features will not work.");
}

export const hf = new InferenceClient(apiKey);

export const HF_MODEL = "webml-community/llama-3.2-reasoning-webgpu"; 
