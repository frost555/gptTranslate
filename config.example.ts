import { ModelName } from "./types";

export const targetLanguage = "Russian";
export const modelName: ModelName = "anthropic/claude-3.5-sonnet";
export const chunkSize = 1000;

const whiteList = [
  "example1.md",
  "example2.md",
  "example3.md",
];

export const pageFilter = (section: { page: number; fileName: string }) =>
  (section.page >= 1 && section.page < 100) ||
  whiteList.includes(section.fileName) ||
  section.fileName.startsWith("exampleChapter");
