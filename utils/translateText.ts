import { sendOpenrouter } from "../sendOpenrouter";
import { setTimeout } from "timers/promises";
import { ModelName } from "../types";

export const translateText = async (
  systemPrompt: string,
  prompt: string,
  modelName: ModelName = "anthropic/claude-3.5-sonnet"
): Promise<string> => {
  let retries = 0;
  const maxRetries = 5;
  const retryDelay = 10000; // 10 seconds in milliseconds

  while (retries < maxRetries) {
    try {
      const response = await sendOpenrouter({
        systemPrompt,
        prompt,
        temperature: 0,
        modelName,
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
