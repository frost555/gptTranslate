# Book Translation Tool

This tool provides automated book translation using the OpenRouter API.

## Setup

1. Make sure you have Node.js and npm installed.
2. Clone the repository and navigate to the project folder.
3. Install dependencies by running:
   ```
   npm install
   ```
4. Create a `.env` file in the project root and add your OpenRouter API key:
   ```
   OPENROUTER_API_KEY=your_api_key_here
   ```

## File Structure

- `data/`: source files directory
  - Place your markdown files for translation directly in this folder
- `result/`: translation results directory
  - `[language]/claude/`: translated files
  - `kr/`: original text files with chunk markers
- `logs/`: request logs directory (created automatically)

## Configuration

1. Create `config.ts` based on `config.example.ts`.
2. Configure the following parameters:

   - `targetLanguage`: target translation language ("Russian" or "English")
   - `chunkSize`: text chunk size for translation (default: 600)
   - `filesToTranslate`: array of markdown files to translate

   Example configuration:

   ```typescript
   export const targetLanguage = "English";
   export const chunkSize = 600;
   
   export const filesToTranslate = [
     "example.md",
   ];
   ```

## Running the Translation

1. Place your markdown files in the `data/` folder
2. Make sure you've configured `config.ts`
3. Run the translation process:

   ```
   npx ts-node src/translateBook.ts
   ```

## Results

After the program completes:

1. Translated files will be saved in `result/[language]/claude/`
2. Original texts with chunk markers will be saved in `result/kr/`
3. API request logs will be saved in the `logs/` folder

## Telegram Bot

To run the Telegram bot:

```
pm2 start npm --name "tgbot" -- run start-bot
```
