import fs from "fs";

import {
  createEmbedding,
  type KnowledgeChunk,
} from "../src/rag/index.js";

const inputPath =
  "data/processed/amazon_knowledge.json";

const outputDir = "data/vector";

const BATCH_SIZE = 500;
const CONCURRENCY = 10;

const chunks: KnowledgeChunk[] = JSON.parse(
  fs.readFileSync(inputPath, "utf-8")
);

fs.mkdirSync(outputDir, { recursive: true });

async function processChunk(
  chunk: KnowledgeChunk
) {
  const embedding = await createEmbedding(chunk.text);

  return {
    chunk,
    embedding,
  };
}

async function processBatch(
  batch: KnowledgeChunk[]
) {
  const results = [];

  for (let i = 0; i < batch.length; i += CONCURRENCY) {
    const group = batch.slice(i, i + CONCURRENCY);

    const embeddings = await Promise.all(
      group.map(processChunk)
    );

    results.push(...embeddings);
  }

  return results;
}

console.log("\n===== AMAZON VECTOR INDEX =====");
console.log("Total chunks:", chunks.length);
console.log("Batch size:", BATCH_SIZE);
console.log("Concurrency:", CONCURRENCY);

let completed = 0;

for (
  let start = 0;
  start < chunks.length;
  start += BATCH_SIZE
) {
  const batchNumber = Math.floor(
    start / BATCH_SIZE
  );

  const end = Math.min(
    start + BATCH_SIZE,
    chunks.length
  );

  const batch = chunks.slice(start, end);

  const outputPath =
    `${outputDir}/amazon_vectors_${String(
      batchNumber
    ).padStart(4, "0")}.json`;

  // Skip already completed batches.
  if (fs.existsSync(outputPath)) {
    completed += batch.length;

    console.log(
      `Skipping batch ${batchNumber} — already complete (${completed}/${chunks.length})`
    );

    continue;
  }

  const vectors = await processBatch(batch);

  fs.writeFileSync(
    outputPath,
    JSON.stringify(vectors)
  );

  completed += batch.length;

  console.log(
    `Batch ${batchNumber} complete: ${completed}/${chunks.length}`
  );
}

console.log("\n===== VECTOR INDEX COMPLETE =====");
console.log("Vectors:", completed);
console.log("Saved to:", outputDir);
console.log("=================================\n");