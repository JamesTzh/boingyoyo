export interface ChatTurn {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LlmProvider {
  complete(messages: ChatTurn[], opts?: { temperature?: number; maxTokens?: number }): Promise<string>;
}
