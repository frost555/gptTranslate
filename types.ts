export type ModelName =
  | 'deepseek/deepseek-chat'
  | 'anthropic/claude-3.5-sonnet'
  | 'meta-llama/llama-3.1-405b-instruct';

export type DictionaryItem = {
  term: string;
  translation: string;
  explanation?: string;
};
