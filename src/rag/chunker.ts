import type { KnowledgeDocument } from "./documents.js";

export interface KnowledgeChunk extends KnowledgeDocument {
  chunkId: string;
  text: string;
}

export function createKnowledgeChunks(
  documents: KnowledgeDocument[]
): KnowledgeChunk[] {
  return documents.map((document) => ({
    ...document,
    chunkId: `${document.brand}-${document.id}`,
    text: [
      `Intent: ${document.intent}`,
      `Customer issue: ${document.question}`,
      `Support guidance: ${document.answer}`,
    ].join("\n"),
  }));
}