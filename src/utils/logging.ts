import * as fs from "fs";
import * as path from "path";

let requestNumber = 0;

export function cleanLogsFolder() {
  const logsFolder = path.join(__dirname, '..', 'logs');
  if (fs.existsSync(logsFolder)) {
    fs.readdirSync(logsFolder).forEach((file) => {
      const filePath = path.join(logsFolder, file);
      fs.unlinkSync(filePath);
    });
  } else {
    fs.mkdirSync(logsFolder);
  }
}

export function logUserPrompt(prompt: string) {
  const logsFolder = path.join(__dirname, '..', 'logs');
  const logFile = path.join(logsFolder, `${++requestNumber}.txt`);
  fs.writeFileSync(logFile, prompt, 'utf-8');
}
