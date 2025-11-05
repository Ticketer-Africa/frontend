// utils/truncate.ts
export function truncateText(text: string, wordLimit: number): string {
  if (!text) return "";
  const words = text.split(" ");
  if (words.length <= wordLimit) return text;
  return words.slice(0, wordLimit).join(" ") + "...";
}
