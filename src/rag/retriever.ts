import type { KnowledgeChunk } from "./chunker.js";

export interface RetrievedChunk {
  chunk: KnowledgeChunk;
  score: number;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

function calculateScore(
  queryTokens: Set<string>,
  chunk: KnowledgeChunk
): number {
  const questionTokens = new Set(
    tokenize(chunk.question)
  );

  const answerTokens = new Set(
    tokenize(chunk.answer)
  );

  let score = 0;

  for (const token of queryTokens) {
    // Customer-question match is more important
    if (questionTokens.has(token)) {
      score += 3;
    }

    // Support-answer match is useful but lower weight
    if (answerTokens.has(token)) {
      score += 1;
    }
  }

  return score;
}

export function retrieveRelevantChunks(
  query: string,
  chunks: KnowledgeChunk[],
  topK = 5
): RetrievedChunk[] {
  const queryTokens = new Set(tokenize(query));

  if (queryTokens.size === 0) {
    return [];
  }

  return chunks
    .map((chunk) => ({
      chunk,
      score: calculateScore(queryTokens, chunk),
    }))
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}