import { deleteFileIfExists, createEmptyFile } from "./utils/files";
import { getSystemPrompt, getPrompt } from "./generatePrompt";
import * as path from "path";
import * as fs from "fs";
import { prepareChunks } from "./utils/prepareChunks";
import { placeTags } from "./utils/placeTags";
import { cleanLogsFolder, logUserPrompt } from "./utils/logging";
import { targetLanguage, chunkSize, filesToTranslate } from "../config";
import { getDictionary } from "./utils/getDictionary";
import { translateText } from "./utils/translateText";
import dotenv from "dotenv";
import { DictionaryItem } from "../types";

// Load environment variables
dotenv.config();

function appendTranslatedChunk(
  filePath: string,
  chunkIndex: number,
  translatedChunk: string,
): void {
  fs.appendFileSync(
    filePath,
    `<!-- ${chunkIndex + 1} -->\n\n${translatedChunk}\n\n`,
    { encoding: "utf-8" },
  );
}

function appendOriginalChunk(
  filePath: string,
  chunkIndex: number,
  originalChunk: string,
): void {
  fs.appendFileSync(
    filePath,
    `\n <!-- ${chunkIndex + 1} -->  \n${originalChunk}\n`,
    { encoding: "utf-8" },
  );
}

const translateBookText = async (
  main: string,
  before: string,
  after: string,
  dictionary: DictionaryItem[],
): Promise<string> => {
  const systemPrompt = getSystemPrompt(targetLanguage);
  const prompt = getPrompt({
    targetLanguage,
    before,
    main,
    after,
    dictionary,
  });

  logUserPrompt(prompt);

  return translateText(systemPrompt, prompt, "anthropic/claude-3.5-sonnet");
};

function getLastFiveSentences(text: string): string {
  const sentences = text.match(/[^.]+[.]+/g) || [];
  return sentences.slice(-5).join(" ").trim();
}

function getFirstFiveSentences(text: string): string {
  const sentences = text.match(/[^.]+[.]+/g) || [];
  return sentences.slice(0, 5).join(" ").trim();
}

type SplitAndTranslateFileArgs = {
  files: string[];
  sourceFolder: string;
  resultFolder: string;
  resultOriginalFolder: string;
  targetLanguage: "Russian" | "English";
  chunkSize: number;
};

async function splitAndTranslateFile(args: SplitAndTranslateFileArgs) {
  cleanLogsFolder();

  const {
    files,
    sourceFolder,
    resultFolder,
    resultOriginalFolder,
    targetLanguage,
    chunkSize,
  } = args;

  const dictionary = await getDictionary();

  const languageCode = targetLanguage.toLowerCase();
  const translatedResultFolder = path.join(
    resultFolder,
    languageCode,
    "claude",
  );

  // Ensure the translated result folder exists
  if (!fs.existsSync(translatedResultFolder)) {
    fs.mkdirSync(translatedResultFolder, { recursive: true });
  }

  for (let fileName of files) {
    const resultFilePath = path.join(translatedResultFolder, fileName);
    const resultOriginalPath = path.join(resultOriginalFolder, fileName);

    console.log(resultFilePath);

    deleteFileIfExists(resultFilePath);
    createEmptyFile(resultFilePath);

    createEmptyFile(resultOriginalPath);

    const pageContent = fs.readFileSync(path.join(sourceFolder, fileName), {
      encoding: "utf-8",
    });

    const originalChunks = prepareChunks(pageContent, chunkSize);
    const chunks = originalChunks.map((x) => placeTags(x));

    console.log(chunks.map((x) => x.length));

    for (let i = 0; i < chunks.length; ++i) {
      const chunk = chunks[i];

      const before = i > 0 ? getLastFiveSentences(originalChunks[i - 1]) : "";
      const after =
        i < originalChunks.length - 1
          ? getFirstFiveSentences(originalChunks[i + 1])
          : "";
      const translatedChunk = await translateBookText(
        chunk,
        before,
        after,
        dictionary,
      );

      appendTranslatedChunk(resultFilePath, i, translatedChunk);
      appendOriginalChunk(resultOriginalPath, i, originalChunks[i]);

      console.log(i);
    }

    console.log(
      "Translation and concatenation complete. Result saved to",
      resultFilePath,
    );
  }
}

const sourceFolder = path.join("data");
const resultFolder = path.join("result");
const resultKrFolder = path.join("result", "kr");

function ensureResultFoldersExist(folders: string[]) {
  folders.forEach((folder) => {
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
  });
}

async function run() {
  ensureResultFoldersExist([resultFolder, resultKrFolder]);
  await splitAndTranslateFile({
    files: filesToTranslate,
    sourceFolder,
    resultFolder,
    resultOriginalFolder: resultKrFolder,
    targetLanguage,
    chunkSize,
  });
}

run();
