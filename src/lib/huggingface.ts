import { InferenceClient } from '@huggingface/inference';

const apiKey = process.env.HUGGINGFACE_API_KEY;

if (!apiKey || apiKey === 'hf_your_token_here') {
  console.warn("Missing HUGGINGFACE_API_KEY environment variable. AI features will not work.");
}

export const hf = new InferenceClient(apiKey);

// Using Llama-3-8B-Instruct as it is reliable on the free tier
export const HF_MODEL = "meta-llama/Meta-Llama-3-8B-Instruct"; 
