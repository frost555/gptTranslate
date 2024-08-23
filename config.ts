import { ModelName } from "./types";

export const targetLanguage = "Russian";
export const modelName: ModelName = "anthropic/claude-3.5-sonnet";
export const chunkSize = 1000;

const whiteList = [
  "c6s1.md",
  "c6s3.md",
  "c6s5.md",
  "c7s1.md",
  "c7s2.md",
  "c7s3.md",
];

export const pageFilter = (section: { page: number; fileName: string }) =>
  (section.page >= 167 && section.page < 233) ||
  whiteList.includes(section.fileName) ||
  section.fileName.startsWith("c9");
