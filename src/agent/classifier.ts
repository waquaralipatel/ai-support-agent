import { createEmbedding } from "../rag/embedding.js";
import { AMAZON_INTENTS } from "../config/amazon/intents.js";

function cosineSimilarity(
  a: number[],
  b: number[]
): number {
  let dot = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i]! * b[i]!;
  }

  return dot;
}

let intentEmbeddings:
  | Array<{
      id: string;
      embedding: number[];
    }>
  | undefined;

async function getIntentEmbeddings() {
  if (intentEmbeddings) {
    return intentEmbeddings;
  }

  intentEmbeddings = [];

  for (const intent of AMAZON_INTENTS) {
    const embedding = await createEmbedding(
      `${intent.id}: ${intent.description}`
    );

    intentEmbeddings.push({
      id: intent.id,
      embedding,
    });
  }

  return intentEmbeddings;
}

export interface IntentClassification {
  intent: string;
  confidence: number;
}

export async function classifyIntent(
  message: string
): Promise<IntentClassification> {
  const messageEmbedding =
    await createEmbedding(message);

  const candidates =
    await getIntentEmbeddings();

  let bestIntent = "OTHER_SUPPORT";
  let bestScore = -1;

  for (const candidate of candidates) {
    const score = cosineSimilarity(
      messageEmbedding,
      candidate.embedding
    );

    if (score > bestScore) {
      bestScore = score;
      bestIntent = candidate.id;
    }
  }

  return {
    intent: bestIntent,
    confidence: bestScore,
  };
}