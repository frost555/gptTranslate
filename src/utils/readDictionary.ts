import { readFileSync } from 'fs';
import { join } from 'path';
import { DictionaryItem } from '../../types';

export function readDictionary(): DictionaryItem[] {
  try {
    const dictionaryPath = join(process.cwd(), 'dictionary.json');
    const data = readFileSync(dictionaryPath, 'utf-8');
    const jsonData = JSON.parse(data) as string[][];

    return jsonData.map((item) => {
      const [term, translation, explanation] = item;
      return {
        term,
        translation,
        ...(explanation ? { explanation } : {}),
      };
    });
  } catch (error) {
    console.error('Error reading dictionary:', error);
    return [];
  }
}
