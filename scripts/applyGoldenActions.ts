import fs from "fs";

const inputPath =
  "tests/evaluation/amazon/golden-set.json";

const outputPath =
  "tests/evaluation/amazon/golden-set.json";

const goldenSet = JSON.parse(
  fs.readFileSync(inputPath, "utf-8")
);

for (const item of goldenSet) {
  const intent = item.verified_intent;

  if (
    intent === "ACCOUNT_ACCESS" ||
    intent === "PAYMENT_BILLING" ||
    intent === "RETURNS_REFUNDS" ||
    intent === "ORDER_CANCELLATION" ||
    intent === "ORDER_DELIVERY"
  ) {
    item.expected_action = "ESCALATE";
  } else {
    item.expected_action = "AUTO_HANDLE";
  }

  item.response_requirements = [
    "Acknowledge the customer's issue",
    "Provide a clear and relevant response",
    "Do not invent order, account, payment, or personal information",
    "Escalate when the issue requires account-level or manual investigation",
  ];
}

fs.writeFileSync(
  outputPath,
  JSON.stringify(goldenSet, null, 2)
);

console.log("\n===== GOLDEN SET ACTIONS COMPLETE =====");
console.log("Total examples:", goldenSet.length);
console.log("expected_action: populated");
console.log("response_requirements: populated");
console.log("Saved to:", outputPath);
console.log("========================================\n");