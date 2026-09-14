import fs from "fs";

import {
  createEmbedding,
  retrieveByVector,
  type KnowledgeChunk,
} from "../src/rag/index.js";

const knowledgePath =
  "data/processed/amazon_knowledge.json";

const allChunks: KnowledgeChunk[] = JSON.parse(
  fs.readFileSync(knowledgePath, "utf-8")
);

// Only use 300 chunks for the first test.
const testChunks = allChunks.slice(0, 300);

console.log("\n===== BUILDING TEST VECTOR INDEX =====");
console.log("Test chunks:", testChunks.length);

const documents = [];

for (const chunk of testChunks) {
  const embedding = await createEmbedding(chunk.text);

  documents.push({
    chunk,
    embedding,
  });
}

console.log("Embeddings created:", documents.length);

const query = "Where is my Amazon order?";

console.log("\n===== VECTOR RETRIEVAL TEST =====");
console.log("Customer:", query);

const results = await retrieveByVector(
  query,
  documents,
  5
);

results.forEach((result, index) => {
  console.log(`\nResult ${index + 1}`);
  console.log(
    "Similarity:",
    result.score.toFixed(4)
  );
  console.log(
    "Customer:",
    result.chunk.question
  );
  console.log(
    "Support:",
    result.chunk.answer
  );
});

console.log("\n==================================\n");