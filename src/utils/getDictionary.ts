import axios from "axios";
import { DictionaryItem } from "../../types";

const dictionaryUrl =
  "https://raw.githubusercontent.com/frost555/gptTranslate/refs/heads/main/dictionary.json";

export async function getDictionary(): Promise<DictionaryItem[]> {
  try {
    const response = await axios.get<string[][]>(dictionaryUrl);

    return response.data.map((item) => {
      const [term, translation, explanation] = item;
      return {
        term,
        translation,
        ...(explanation ? { explanation } : {}),
      };
    });
  } catch (error) {
    console.error("Error fetching dictionary:", error);
    return [];
  }
}
