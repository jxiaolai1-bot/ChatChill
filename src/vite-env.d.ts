/// <reference types="vite/client" />

interface ImportProgress {
  stage: 'detecting' | 'parsing' | 'analyzing' | 'saving' | 'error' | 'completed';
  progress: number;
  message: string;
  bytesRead?: number;
  totalBytes?: number;
  messagesProcessed?: number;
}

 interface ChatApi {
  selectFile: () => Promise<{ filePath?: string; format?: string; error?: string } | null>;
  import: (filePath: string) => Promise<{ success: boolean; sessionId?: string; error?: string }>;
  onImportProgress: (callback: (progress: ImportProgress) => void) => () => void;
  // ... add other methods if needed
}

interface LLMProvider {
  id: string;
  name: string;
  description: string;
  defaultBaseUrl: string;
  models: Array<{ id: string; name: string; description?: string }>;
}

interface AIServiceConfigDisplay {
  id: string;
  name: string;
  provider: string;
  apiKey: string;
  apiKeySet: boolean;
  model?: string;
  baseUrl?: string;
  maxTokens?: number;
  createdAt: number;
  updatedAt: number;
}

interface LLMApi {
  getProviders: () => Promise<LLMProvider[]>;
  getAllConfigs: () => Promise<AIServiceConfigDisplay[]>;
  getActiveConfigId: () => Promise<string | null>;
  addConfig: (config: {
    name: string;
    provider: string;
    apiKey: string;
    model?: string;
    baseUrl?: string;
    maxTokens?: number;
  }) => Promise<{ success: boolean; config?: AIServiceConfigDisplay; error?: string }>;
  updateConfig: (
    id: string,
    updates: {
      name?: string;
      provider?: string;
      apiKey?: string;
      model?: string;
      baseUrl?: string;
      maxTokens?: number;
    }
  ) => Promise<{ success: boolean; error?: string }>;
  deleteConfig: (id?: string) => Promise<{ success: boolean; error?: string }>;
  setActiveConfig: (id: string) => Promise<{ success: boolean; error?: string }>;
  validateApiKey: (provider: string, apiKey: string, baseUrl?: string, model?: string) => Promise<boolean>;
}

interface Window {
  chatApi: ChatApi;
  llmApi: LLMApi;
}