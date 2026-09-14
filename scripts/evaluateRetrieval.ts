import fs from "fs";
import {
  retrieveFromAmazonVectorStore,
} from "../src/rag/index.js";

interface GoldenExample {
  id: string;
  customer_message: string;
  verified_intent?: string;
  verified?: boolean;
}

const goldenPath =
  "tests/evaluation/amazon/golden-set.json";

const goldenSet: GoldenExample[] = JSON.parse(
  fs.readFileSync(goldenPath, "utf-8")
);

const examples = goldenSet.filter(
  (item) =>
    item.verified === true &&
    item.customer_message
);

const TOP_K = 5;

let successfulRetrievals = 0;

console.log("\n===== RETRIEVAL EVALUATION =====");
console.log(
  `Golden examples: ${examples.length}`
);
console.log(
  `Top-K: ${TOP_K}`
);

for (let i = 0; i < examples.length; i++) {
  const example = examples[i];

  if (!example) continue;

  const results =
    await retrieveFromAmazonVectorStore(
      example.customer_message,
      TOP_K
    );

  const bestScore = results[0]?.score ?? 0;

  /*
   * Initial retrieval-quality signal.
   *
   * We intentionally do NOT treat similarity alone
   * as the final correctness metric.
   *
   * This gives us a baseline before adding
   * intent-aware reranking.
   */
  const passed = bestScore >= 0.65;

  if (passed) {
    successfulRetrievals++;
  }

  if (
    (i + 1) % 10 === 0 ||
    i === examples.length - 1
  ) {
    console.log(
      `Processed ${i + 1}/${examples.length}`
    );
  }
}

const recallAtK =
  examples.length === 0
    ? 0
    : successfulRetrievals / examples.length;

console.log("\n===== RESULTS =====");

console.log(
  `Passed: ${successfulRetrievals}/${examples.length}`
);

console.log(
  `Baseline Recall@${TOP_K}: ${(recallAtK * 100).toFixed(2)}%`
);

console.log("===================\n");