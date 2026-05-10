export function chunkText(text, chunkSize = 1200, overlap = 200) {
  if (!text) return [];

  const cleanText = text
    .replace(/\s+/g, " ")
    .trim();

  const chunks = [];

  let start = 0;

  while (start < cleanText.length) {
    const end = start + chunkSize;

    const chunk = cleanText.slice(start, end);

    chunks.push(chunk);

    start += chunkSize - overlap;
  }

  return chunks;
}