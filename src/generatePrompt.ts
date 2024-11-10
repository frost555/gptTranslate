const englishExpected = `
Input:
사람의 소리는 이 소리 문<o>[聲門]</o>의 틈난 사이를 통하여 나가는 기운 <o>(呼氣)</o>에 의하여 멀리어 움직여서 <o>(振動)</o> 소리가 나게<o>[發聲]</o>되는 것이다.
Output:
The human voice is produced when air <o>(呼氣)</o> passes through the gap of the <o>[聲門]</o> (vocal cords), causing them to move <o>(振動)</o> and create sound <o>[發聲]</o>.
`;

const russianExpected = `
Input:
사람의 소리는 이 소리 문<o>[聲門]</o>의 틈난 사이를 통하여 나가는 기운 <o>(呼氣)</o>에 의하여 멀리어 움직여서 <o>(振動)</o> 소리가 나게<o>[發聲]</o>되는 것이다.
Output:
Человеческий голос образуется, когда воздух <o>(呼氣)</o> проходит через голосовую щель <o>[聲門]</o>, вызывая колебания <o>(振動)</o> и создавая звук <o>[發聲]</o>.
`;

export function getSystemPrompt(
  targetLanguage: 'Russian' | 'English' = 'Russian',
) {
  return `You are a professional translator with expertise in multiple languages. 
  Your task is to translate text from a source language to a target language, maintaining the original tone, style, and meaning as closely as possible. 
  You should follow specific translation instructions and consider the context provided before and after the main text to ensure accuracy and consistency.
  `;
}

import { DictionaryItem } from '../types';
import { generateDictionaryPrompt } from './utils/generateDictionaryPrompt';

function getTranslationRules({
  before,
  after,
  dictionary,
  main,
}: {
  before?: string;
  after?: string;
  dictionary: DictionaryItem[];
  main: string;
}): string {
  const baseRules = ['Translate only the text within the <main_text> tags.'];

  if (before || after) {
    const contextTags = [
      before && '<context_before>',
      after && '<context_after>',
    ]
      .filter(Boolean)
      .join(' and ');

    baseRules.push(
      `Use the content in ${contextTags} tags to ensure consistency in terminology, style, and context.`,
    );
  }

  baseRules.push(generateDictionaryPrompt({ dictionary, text: main }));

  return baseRules.map((rule, index) => `${index + 1}. ${rule}`).join('\n');
}

type Options = {
  targetLanguage: 'Russian' | 'English';
  before?: string;
  main: string;
  after?: string;
  dictionary: DictionaryItem[];
};

export function getPrompt({
  targetLanguage = 'Russian',
  before,
  main,
  after,
  dictionary,
}: Options) {
  const example =
    targetLanguage === 'Russian' ? russianExpected : englishExpected;

  const rules = getTranslationRules({ before, after, dictionary, main });

  return `
Translate the following text from Korean to ${targetLanguage}. Follow these instructions:

${rules}

${before ? `<context_before>\n${before}\n</context_before>\n\n` : ''}
<main_text>
${main}
</main_text>
${after ? `\n\n<context_after>\n${after}\n</context_after>` : ''}

Provide translation of the <main_text>`;
}
