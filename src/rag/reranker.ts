import type { VectorResult } from "./vectorRetriever.js";

export type RelevanceLevel =
  | "high"
  | "medium"
  | "low";

export interface RankedResult extends VectorResult {
  relevance: RelevanceLevel;
}

const HIGH_THRESHOLD = 0.72;
const MEDIUM_THRESHOLD = 0.62;

function getRelevance(
  score: number
): RelevanceLevel {
  if (score >= HIGH_THRESHOLD) {
    return "high";
  }

  if (score >= MEDIUM_THRESHOLD) {
    return "medium";
  }

  return "low";
}

export function rerankResults(
  results: VectorResult[],
  topK = 3
): RankedResult[] {
  return results
    .map((result): RankedResult => ({
      ...result,
      relevance: getRelevance(result.score),
    }))
    .filter(
      (result) => result.relevance !== "low"
    )
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}