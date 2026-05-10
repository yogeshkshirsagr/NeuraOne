import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function createEmbedding(text) {
  if (!text || text.trim().length === 0) {
    return null;
  }

  const response =
    await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });

  return response.data[0].embedding;
}