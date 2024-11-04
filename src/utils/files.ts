import * as fs from "fs";

/**
 * Deletes a file if it exists at the specified path.
 * @param filePath - The path to the file to be deleted.
 */
export function deleteFileIfExists(filePath: string): void {
  if (fs.existsSync(filePath)) {
    fs.rmSync(filePath); // Remove the existing file synchronously.
  }
}

/**
 * Creates an empty file at the specified path with UTF-8 encoding.
 * @param filePath - The path where the file will be created.
 */
export function createEmptyFile(filePath: string): void {
  fs.writeFileSync(filePath, "", { encoding: "utf-8" }); // Specify the encoding as UTF-8.
}

/**
 * Appends a chapter title to the file if it exists.
 * @param filePath - The path where the file is located.
 * @param section - The section object containing the chapter and page information.
 */
export function appendChapterTitle(
  filePath: string,
  section: { chapter?: string; title: string }
): void {
  if (section.chapter) {
    fs.appendFileSync(filePath, "# " + section.chapter + "\n\n", {
      encoding: "utf-8",
    });
  }
}

/**
 * Appends a section title and page range to the file.
 * @param filePath - The path where the file is located.
 * @param section - The section object containing the title and page information.
 * @param finalPage - The final page number in the document.
 */
export function appendSectionTitle(
  filePath: string,
  section: { title: string; page: number },
  finalPage: number
): void {
  fs.appendFileSync(
    filePath,
    "## " + section.title + `(page ${section.page}-${finalPage - 1})` + "\n\n",
    { encoding: "utf-8" } // Specify the encoding as UTF-8.
  );
}
