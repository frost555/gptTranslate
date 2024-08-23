import {
  deleteFileIfExists,
  createEmptyFile,
  appendChapterTitle,
  appendSectionTitle,
} from "./utils/files";
import { sendOpenrouter } from "./sendOpenrouter";
import { getSystemPrompt, getPrompt } from "./generatePrompt";
import * as path from "path";
import * as fs from "fs";
import { prepareChunks } from "./utils/prepareChunks";
import { placeTags } from "./utils/placeTags";
import { cleanLogsFolder, logUserPrompt } from "./utils/logging";
import { ModelName } from "./types";
import { setTimeout } from "timers/promises";
import { targetLanguage, modelName, chunkSize, pageFilter } from "./config";

type ModelInfo = {
  [key in ModelName]: { shortName: string };
};

const models: ModelInfo = {
  "deepseek/deepseek-chat": { shortName: "deepseek" },
  "anthropic/claude-3.5-sonnet": { shortName: "claude" },
  "meta-llama/llama-3.1-405b-instruct": { shortName: "llama" },
};

function appendTranslatedChunk(
  filePath: string,
  chunkIndex: number,
  translatedChunk: string
): void {
  fs.appendFileSync(
    filePath,
    `<!-- ${chunkIndex + 1} -->\n\n${translatedChunk}\n\n`,
    { encoding: "utf-8" }
  );
}

function appendOriginalChunk(
  filePath: string,
  chunkIndex: number,
  originalChunk: string
): void {
  fs.appendFileSync(
    filePath,
    `\n <!-- ${chunkIndex + 1} -->  \n${originalChunk}\n`,
    { encoding: "utf-8" }
  );
}

type Section = {
  title: string;
  page: number;
  fileName: string;
  chapter?: string;
};

const translateText = async (
  main: string,
  before: string,
  after: string
): Promise<string> => {
  const systemPrompt = getSystemPrompt(targetLanguage);
  const prompt = getPrompt({
    targetLanguage,
    before,
    main,
    after,
  });

  logUserPrompt(prompt);

  let retries = 0;
  const maxRetries = 5;
  const retryDelay = 10000; // 10 seconds in milliseconds

  while (retries < maxRetries) {
    try {
      const response = await sendOpenrouter({
        systemPrompt,
        prompt,
        temperature: 0,
        modelName: modelName,
      });
      return response;
    } catch (error) {
      console.error(`Attempt ${retries + 1} failed:`, error);
      retries++;
      if (retries < maxRetries) {
        console.log(`Retrying in ${retryDelay / 1000} seconds...`);
        await setTimeout(retryDelay);
      } else {
        console.error(`All ${maxRetries} attempts failed. Giving up.`);
        throw error;
      }
    }
  }

  throw new Error("This line should never be reached");
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
  tocFilePath: string;
  sectionsFolder: string;
  resultFolder: string;
  resultOriginalFolder: string;
  filter: (section: Section) => boolean;
};

async function splitAndTranslateFile(args: SplitAndTranslateFileArgs) {
  cleanLogsFolder();

  const {
    tocFilePath,
    sectionsFolder,
    resultFolder,
    resultOriginalFolder,
    filter,
  } = args;
  const tocData = fs.readFileSync(tocFilePath, "utf-8");
  const toc: Section[] = JSON.parse(tocData);

  const matchedSections = toc.filter(filter);

  const languageCode = targetLanguage.toLowerCase();
  const modelShortName = models[modelName].shortName;
  const translatedResultFolder = path.join(
    resultFolder,
    languageCode,
    modelShortName
  );

  // Ensure the translated result folder exists
  if (!fs.existsSync(translatedResultFolder)) {
    fs.mkdirSync(translatedResultFolder, { recursive: true });
  }

  for (let section of matchedSections) {
    const resultFilePath = path.join(translatedResultFolder, section.fileName);
    const resultOriginalPath = path.join(
      resultOriginalFolder,
      section.fileName
    );

    const ix = toc.findIndex((x) => x === section);
    const finalPage = toc[ix + 1]?.page ?? 99999;

    console.log(resultFilePath);

    deleteFileIfExists(resultFilePath); // Check if the result file already exists; if so, delete it.
    createEmptyFile(resultFilePath); // Create an empty file at the specified result file path with UTF-8 encoding.

    // Check if the section's chapter title is the same as its own title.
    if (section.chapter === section.title) {
      appendSectionTitle(
        resultFilePath,
        { title: section.title, page: section.page },
        finalPage
      ); // Append the chapter title and page range to the file.
    } else {
      appendChapterTitle(resultFilePath, section); // If there is a chapter, append it with a newline at the beginning of the file.
      appendSectionTitle(
        resultFilePath,
        { title: section.title, page: section.page },
        finalPage
      ); // Append the section title and page range to the file with a newline at the beginning.
    }

    createEmptyFile(resultOriginalPath);

    const pageContent = fs.readFileSync(
      path.join(sectionsFolder, section.fileName),
      {
        encoding: "utf-8",
      }
    );

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
      const translatedChunk = await translateText(chunk, before, after);

      appendTranslatedChunk(resultFilePath, i, translatedChunk);
      appendOriginalChunk(resultOriginalPath, i, originalChunks[i]);

      console.log(i);
    }

    console.log(
      "Translation and concatenation complete. Result saved to",
      resultFilePath
    );
  }
}

const sourceFolder = path.join(__dirname, "data", "sections");
const resultFolder = path.join(__dirname, "result");
const resultKrFolder = path.join(__dirname, "result", "kr");
const tocFilePath = path.join(__dirname, "data", "toc.json");

// Execute the function with your folder paths and filter function
splitAndTranslateFile({
  tocFilePath,
  sectionsFolder: sourceFolder,
  resultFolder,
  resultOriginalFolder: resultKrFolder,
  filter: pageFilter,
});
