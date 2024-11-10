import { generateDictionaryPrompt } from '../utils/generateDictionaryPrompt';
import { DictionaryItem } from '../../types';

export function getSystemPrompt() {
  return `You are a professional translator with expertise in multiple languages. 
Your task is to translate text from a source language to a target language, maintaining the original tone, style, and meaning as closely as possible.`;
}

type Options = {
  targetLanguage: 'Russian' | 'English';
  text: string;
  dictionary: DictionaryItem[];
};

export function getPrompt({
  targetLanguage = 'Russian',
  text,
  dictionary,
}: Options) {
  return `
${generateDictionaryPrompt({ text, dictionary })}

Translate the following text from Korean to ${targetLanguage}. 
${text}
  `;
}
