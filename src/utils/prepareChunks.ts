export function prepareChunks(text: string, maxChunkLength: number): string[] {
  const chunks: string[] = []; // Array to hold the chunks of text
  let currentText = text; // String to keep track of the remaining text to be chunked

  while (currentText.length > maxChunkLength) {
    let lastPeriod = currentText
      .substring(0, maxChunkLength + 1)
      .lastIndexOf(".");

    // Check if there's a period within the limit of maxChunkLength
    if (lastPeriod > -1 && lastPeriod <= maxChunkLength) {
      // If there is a period, we use it to cut the chunk
      chunks.push(currentText.substring(0, lastPeriod + 1).trim());
      currentText = currentText.substring(lastPeriod + 1).trim();
    } else {
      // If no period is found, cut at maxChunkLength
      let spaceBeforeMax = currentText
        .substring(0, maxChunkLength)
        .lastIndexOf(" ");
      if (spaceBeforeMax > -1) {
        chunks.push(currentText.substring(0, spaceBeforeMax).trim());
        currentText = currentText.substring(spaceBeforeMax).trim();
      } else {
        // If no space found, hard cut at maxChunkLength
        chunks.push(currentText.substring(0, maxChunkLength).trim());
        currentText = currentText.substring(maxChunkLength).trim();
      }
    }
  }

  // Add any remaining text as the last chunk if it's not empty
  if (currentText.length > 0) {
    chunks.push(currentText.trim());
  }

  return chunks;
}
