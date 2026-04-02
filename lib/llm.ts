/**
 * Конфігурація Azure OpenAI з лінивою ініціалізацією
 */

import { AzureChatOpenAI } from "@langchain/openai";

export interface AzureOpenAIConfig {
  apiKey: string;
  endpoint: string;
  deploymentName: string;
  apiVersion: string;
}

let _llm: AzureChatOpenAI | null = null;
let _initialized = false;

/**
 * Отримує або створює екземпляр Azure OpenAI
 * Якщо ключ не надано, повертає null
 */
export function getLLM(): AzureChatOpenAI | null {
  if (_initialized) {
    return _llm;
  }

  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;

  console.log("Azure config:", {
    endpoint,
    deployment: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
    version: process.env.AZURE_OPENAI_API_VERSION,
  });

  if (!apiKey || !endpoint) {
    console.warn("Azure OpenAI API key or endpoint not found. LLM features will be disabled.");
    _initialized = true;
    return null;
  }

  try {
    _llm = new AzureChatOpenAI({
      azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_INSTANCE_NAME || "market-research-bot-sweden",
      azureOpenAIApiKey: apiKey,
      azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-5-chat",
      azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION || "2024-02-15-preview",
      temperature: 0.1,
      maxTokens: 4000,
    });
    _initialized = true;
    return _llm;
  } catch (error) {
    console.error("Failed to initialize Azure OpenAI:", error);
    _initialized = true;
    return null;
  }
}
