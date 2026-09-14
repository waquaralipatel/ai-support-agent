import fs from "fs";

const inputPath =
  "tests/evaluation/amazon/golden-candidates.json";

const outputPath =
  "tests/evaluation/amazon/golden-set.json";

const candidates = JSON.parse(
  fs.readFileSync(inputPath, "utf-8")
);

const goldenSet = candidates.map((item: any) => ({
  id: item.id,

  customer_message: item.customer_message,

  source_agent_response: item.agent_response,

  expected_intent: item.suggested_intent,

  expected_action: "",

  response_requirements: [],

  source_customer_tweet_id:
    item.source_customer_tweet_id,

  source_agent_tweet_id:
    item.source_agent_tweet_id,

  verified: false,
}));

fs.writeFileSync(
  outputPath,
  JSON.stringify(goldenSet, null, 2)
);

console.log("\n===== GOLDEN SET CREATED =====");
console.log("Total candidates:", candidates.length);
console.log("Golden set entries:", goldenSet.length);
console.log("Saved to:", outputPath);
console.log("==============================\n");