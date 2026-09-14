import fs from "fs";

import {
  retrieveRelevantChunks,
  type KnowledgeChunk,
} from "../src/rag/index.js";

const knowledgePath =
  "data/processed/amazon_knowledge.json";

const chunks: KnowledgeChunk[] = JSON.parse(
  fs.readFileSync(knowledgePath, "utf-8")
);

const testQueries = [
  "Where is my order?",
  "My package was delivered but I did not receive it.",
  "I want a refund for my order.",
  "I cannot login to my Amazon account.",
  "My Prime Video is not working.",
  "My Fire TV Stick is not working.",
];

console.log("\n===== RETRIEVER TEST =====");

for (const query of testQueries) {
  console.log(`\nCustomer: ${query}`);

  const results = retrieveRelevantChunks(
    query,
    chunks,
    3
  );

  if (results.length === 0) {
    console.log("No results found.");
    continue;
  }

  results.forEach((result, index) => {
    console.log(`\nResult ${index + 1}`);
    console.log("Score:", result.score);
    console.log(
      "Customer:",
      result.chunk.question
    );
    console.log(
      "Support:",
      result.chunk.answer
    );
  });
}

console.log("\n=========================\n");