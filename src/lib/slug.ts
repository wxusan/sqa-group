export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/o['ʻ’`]/g, "o")
    .replace(/g['ʻ’`]/g, "g")
    .replace(/['ʻ’`]/g, "")
    .replace(/[^a-z0-9а-яё]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || `item-${Date.now()}`;
}
