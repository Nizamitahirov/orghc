export function capitalizeAcronyms(text) {
  if (!text) return text;
  return text.replace(/\bceo\b/gi, 'CEO');
}
