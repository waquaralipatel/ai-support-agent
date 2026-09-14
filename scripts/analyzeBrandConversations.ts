import fs from "fs";

const filePath = "data/processed/amazon_conversations.json";

const conversations = JSON.parse(
  fs.readFileSync(filePath, "utf-8")
);

console.log("\n===== BRAND CONVERSATION ANALYSIS =====");

console.log("Total conversation pairs:", conversations.length);

const languages = new Map<string, number>();

const keywords = {
  delivery: [
    "delivery",
    "deliver",
    "package",
    "parcel",
    "shipping",
    "order",
    "arrive",
    "late",
  ],

  refund: [
    "refund",
    "money back",
    "return",
    "returned",
  ],

  payment: [
    "payment",
    "paid",
    "charge",
    "charged",
    "billing",
    "credit card",
  ],

  account: [
    "account",
    "password",
    "login",
    "sign in",
    "email",
  ],

  prime: [
    "prime",
    "prime video",
    "prime membership",
  ],

  device: [
    "kindle",
    "fire tv",
    "firetv",
    "echo",
    "alexa",
    "device",
  ],

  cancellation: [
    "cancel",
    "cancellation",
  ],
};

const categoryCounts = new Map<string, number>();

for (const conversation of conversations) {
  const text = (
    conversation.customer_message || ""
  ).toLowerCase();

  let matched = false;

  for (const [category, words] of Object.entries(keywords)) {
    if (words.some((word) => text.includes(word))) {
      categoryCounts.set(
        category,
        (categoryCounts.get(category) || 0) + 1
      );

      matched = true;
    }
  }

  if (!matched) {
    categoryCounts.set(
      "other",
      (categoryCounts.get("other") || 0) + 1
    );
  }
}

console.log("\n===== ISSUE CATEGORIES =====\n");

const results = [...categoryCounts.entries()]
  .sort((a, b) => b[1] - a[1]);

for (const [category, count] of results) {
  const percentage = ((count / conversations.length) * 100).toFixed(2);

  console.log(
    `${category.padEnd(15)} ${count} (${percentage}%)`
  );
}

console.log("\n===== SAMPLE CONVERSATIONS =====\n");

for (const conversation of conversations.slice(0, 10)) {
  console.log("Customer:");
  console.log(conversation.customer_message);

  console.log("\nAmazonHelp:");
  console.log(conversation.agent_response);

  console.log("\n-----------------------------\n");
}