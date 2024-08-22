export function placeTags(text: string): string {
  // Replace all instances of text within parentheses and brackets
  return text.replace(/(\([^\)]*\))|(\[[^\]]*\])/g, "<o>$&</o>");
}
