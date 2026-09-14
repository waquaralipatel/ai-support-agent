import fs from "fs";

const inputPath =
  "tests/evaluation/amazon/golden-set.json";

const outputPath =
  "tests/evaluation/amazon/golden-verification.json";

const goldenSet = JSON.parse(
  fs.readFileSync(inputPath, "utf-8")
);

const verificationSet = goldenSet.map((item: any) => ({
  id: item.id,

  customer_message: item.customer_message,

  suggested_intent: item.expected_intent,

  verified_intent: "",

  expected_action: "",

  response_requirements: [],

  source_agent_response: item.source_agent_response,

  verified: false,
}));

fs.writeFileSync(
  outputPath,
  JSON.stringify(verificationSet, null, 2)
);

console.log("\n===== GOLDEN VERIFICATION SET =====");
console.log("Total examples:", verificationSet.length);
console.log("Saved to:", outputPath);
console.log("===================================\n");