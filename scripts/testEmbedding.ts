import { createEmbedding } from "../src/rag/embedding.js";

const query = "Where is my Amazon order?";

console.log("\n===== EMBEDDING TEST =====");
console.log("Query:", query);

const embedding = await createEmbedding(query);

console.log("Embedding dimensions:", embedding.length);
console.log("First 10 values:", embedding.slice(0, 10));

console.log("==========================\n");