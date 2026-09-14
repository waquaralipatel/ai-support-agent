import fs from "fs";

const filePath = "data/processed/amazon_sample_300.json";

const conversations = JSON.parse(
  fs.readFileSync(filePath, "utf-8")
);

console.log("\n===== AMAZON SAMPLE =====");
console.log("Total samples:", conversations.length);

conversations.forEach((conversation: any, index: number) => {
  console.log(`\n========== ${index + 1} ==========`);
  console.log("Customer:");
  console.log(conversation.customer_message);

  console.log("\nAmazonHelp:");
  console.log(conversation.agent_response);
});

console.log("\n==========================");