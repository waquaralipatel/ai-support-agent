import type { KnowledgeChunk } from "./chunker.js";
import { createEmbedding } from "./embedding.js";

export interface VectorDocument {
  chunk: KnowledgeChunk;
  embedding: number[];
}

export async function createVectorDocuments(
  chunks: KnowledgeChunk[]
): Promise<VectorDocument[]> {
  const documents: VectorDocument[] = [];

  for (const chunk of chunks) {
    const embedding = await createEmbedding(chunk.text);

    documents.push({
      chunk,
      embedding,
    });
  }

  return documents;
}