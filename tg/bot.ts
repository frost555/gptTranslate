import { Bot } from "grammy";
import { getPrompt, getSystemPrompt } from "./generatePrompt";
import { getDictionary } from "../utils/getDictionary";
import { translateText } from "../utils/translateText";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

if (!process.env.TELEGRAM_BOT_TOKEN) {
  throw new Error("TELEGRAM_BOT_TOKEN must be set in environment variables");
}

// Create an instance of the `Bot` class and pass your bot token to it.
const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);

const allowedUsers = (process.env.ALLOWED_USERS || "")
  .split(",")
  .filter(Boolean);

const allowedGroup = (process.env.ALLOWED_GROUP_IDS || "")
  .split(",")
  .filter(Boolean)
  .map(Number);

// Handle other messages.
bot.on("message", async (ctx) => {
  try {
    const { message, from } = ctx;

    let isValidRequest = false;
    if (message.chat.type === "private" && allowedUsers.includes(from.username))
      isValidRequest = true;
    if (
      message.chat.type === "group" &&
      allowedGroup.includes(message.chat.id) &&
      message.text.includes("@" + ctx.me.username)
    )
      isValidRequest = true;

    if (!isValidRequest) return;

    const dictionary = await getDictionary();
    const systemPrompt = getSystemPrompt();

    const prompt = getPrompt({
      targetLanguage: "English",
      text: message.text.replace("@" + ctx.me.username, ""),
      dictionary,
    });

    console.log(prompt);

    const translatedText = await translateText(systemPrompt, prompt);
    await ctx.reply(translatedText);
  } catch (error) {
    console.error("Translation error:", error);
    await ctx.reply("Sorry, an error occurred while translating your message.");
  }
});

bot.start();
