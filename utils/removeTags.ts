export function removeTags(text: string): string {
  return text.replace(/<o>|<\/o>/g, "");
}
