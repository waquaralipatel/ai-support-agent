import {
  retrieveFromAmazonVectorStore,
} from "../src/rag/index.js";

const queries = [
  "Where is my Amazon order?",
  "My package was delivered but I did not receive it.",
  "I want a refund for my order.",
  "I cannot login to my Amazon account.",
  "My Prime Video is not working.",
  "My Fire TV Stick is not working.",
];

console.log("\n===== FULL VECTOR RETRIEVER TEST =====");

for (const query of queries) {
  console.log("\nCustomer:", query);

  const results =
    await retrieveFromAmazonVectorStore(query, 3);

  results.forEach(
    (result, index) => {
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
    }
  );

  console.log(
    "\n--------------------------------------"
  );
}

console.log("\n======================================\n");