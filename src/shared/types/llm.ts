export type LlmRole = 'system' | 'user' | 'assistant';

export interface LlmImage {
  mediaType: string;
  dataBase64: string;
}

export interface LlmMessage {
  role: LlmRole;
  content: string;
  images?: LlmImage[];
}

export interface LlmRequest {
  messages: LlmMessage[];
  temperature?: number;
  maxTokens?: number;
  signal?: AbortSignal;
}

export interface LlmResponse {
  text: string;
}

/**
 * Raised when a provider call fails. Carries the provider-facing detail so the
 * UI can surface a precise, plain-English reason rather than a generic failure.
 */
export class LlmError extends Error {
  constructor(
    message: string,
    readonly provider: string,
  ) {
    super(message);
    this.name = 'LlmError';
  }
}
