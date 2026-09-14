import fs from "fs";
import type { KnowledgeDocument } from "../src/rag/documents.js";
import { createKnowledgeChunks } from "../src/rag/chunker.js";

const inputPath =
  "data/processed/amazon_clean.json";

const outputPath =
  "data/processed/amazon_knowledge.json";

const conversations = JSON.parse(
  fs.readFileSync(inputPath, "utf-8")
);

const documents: KnowledgeDocument[] =
  conversations.map((conversation: any, index: number) => ({
    id: `amazon-${index + 1}`,
    brand: "amazon",
    intent: "OTHER_SUPPORT",
    question: conversation.customer_message,
    answer: conversation.agent_response,
    source: "amazon_customer_support_dataset",
  }));

const chunks = createKnowledgeChunks(documents);

fs.writeFileSync(
  outputPath,
  JSON.stringify(chunks, null, 2)
);

console.log("\n===== AMAZON KNOWLEDGE BUILT =====");
console.log("Conversations:", conversations.length);
console.log("Knowledge documents:", documents.length);
console.log("Knowledge chunks:", chunks.length);
console.log("Saved to:", outputPath);
console.log("==================================\n");