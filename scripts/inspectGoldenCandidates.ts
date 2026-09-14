import fs from "fs";

const filePath =
  "tests/evaluation/amazon/golden-candidates.json";

const candidates = JSON.parse(
  fs.readFileSync(filePath, "utf-8")
);

console.log("\n===== GOLDEN CANDIDATES =====");
console.log("Total:", candidates.length);

candidates.forEach((item: any, index: number) => {
  console.log(`\n[${index + 1}] ${item.suggested_intent}`);
  console.log("Customer:", item.customer_message);
  console.log("Agent:", item.agent_response);
  console.log("--------------------------------");
});