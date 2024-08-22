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
  targetLanguage: "Russian" | "English" = "Russian"
) {
  return `You are a professional translator with expertise in multiple languages. 
  Your task is to translate text from a source language to a target language, maintaining the original tone, style, and meaning as closely as possible. 
  You should follow specific translation instructions and consider the context provided before and after the main text to ensure accuracy and consistency.
  `;
}

type Options = {
  targetLanguage: "Russian" | "English";
  before?: string;
  main: string;
  after?: string;
};

export function getPrompt({
  targetLanguage = "Russian",
  before,
  main,
  after,
}: Options) {
  const example =
    targetLanguage === "Russian" ? russianExpected : englishExpected;

  return `
Translate the following text from Korean to ${targetLanguage}. Follow these instructions:

1. Translate only the text within the <main_text> tags.
2. Use the content in <context_before> and <context_after> tags to ensure consistency in terminology, style, and context.
3. Text can contain chinese characters within <o></o> tags. Do not remove them from translation result.

Example of requirement 3:
${example}

<context_before>
${before}
</context_before>

<main_text>
${main}
</main_text>

<context_after>
${after}
</context_after>

Provide translation of the <main_text>`;
}
