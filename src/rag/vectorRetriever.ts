import type { KnowledgeChunk } from "./chunker.js";
import { createEmbedding } from "./embedding.js";

export interface VectorResult {
  chunk: KnowledgeChunk;
  score: number;
}

function cosineSimilarity(
  a: number[],
  b: number[]
): number {
  let dot = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < a.length; i++) {
    const valueA = a[i];
    const valueB = b[i];

    if (valueA === undefined || valueB === undefined) {
      continue;
    }

    dot += valueA * valueB;
    magnitudeA += valueA * valueA;
    magnitudeB += valueB * valueB;
  }

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return (
    dot /
    (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB))
  );
}

export async function retrieveByVector(
  query: string,
  documents: {
    chunk: KnowledgeChunk;
    embedding: number[];
  }[],
  topK = 5
): Promise<VectorResult[]> {
  const queryEmbedding = await createEmbedding(query);

  return documents
    .map((document) => ({
      chunk: document.chunk,
      score: cosineSimilarity(
        queryEmbedding,
        document.embedding
      ),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}