import { DictionaryItem } from "../../types";

type Options = {
  dictionary: DictionaryItem[];
  text: string;
};

export function generateDictionaryPrompt({
  dictionary,
  text,
}: Options): string {
  const relevantItems = dictionary;

  // Format dictionary items into prompt
  const dictionaryPrompt = relevantItems
    .map((item) => {
      const base = `${item.term} - ${item.translation}`;
      return item.explanation ? `${base} (${item.explanation})` : base;
    })
    .join("\n");

  return `Use these translations for specific terms if necessary:\n${dictionaryPrompt}\n`;
}
