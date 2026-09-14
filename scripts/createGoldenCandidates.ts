import fs from "fs";

const inputPath = "data/processed/amazon_clean.json";
const outputPath = "tests/evaluation/amazon/golden-candidates.json";

const conversations = JSON.parse(
  fs.readFileSync(inputPath, "utf-8")
);

const TARGET_PER_INTENT = 20;

const keywords: Record<string, string[]> = {
  ORDER_DELIVERY: [
    "delivery",
    "delivered",
    "package",
    "parcel",
    "shipping",
    "arrive",
    "arrived",
    "late",
    "missing",
  ],

  ORDER_STATUS: [
    "tracking",
    "track my order",
    "order status",
    "where is my order",
    "estimated delivery",
  ],

  RETURNS_REFUNDS: [
    "refund",
    "return",
    "returned",
    "wrong item",
    "damaged",
  ],

  ORDER_CANCELLATION: [
    "cancel",
    "cancellation",
  ],

  PAYMENT_BILLING: [
    "payment",
    "charged",
    "charge",
    "billing",
    "cashback",
    "credit card",
  ],

  ACCOUNT_ACCESS: [
    "account",
    "password",
    "login",
    "sign in",
  ],

  PRIME_MEMBERSHIP: [
    "prime membership",
    "prime subscription",
    "prime member",
    "prime charge",
  ],

  PRIME_VIDEO: [
    "prime video",
    "video",
    "streaming",
    "movie",
    "episode",
  ],

  PRODUCT_DEVICE_SUPPORT: [
    "kindle",
    "fire tv",
    "firetv",
    "echo",
    "alexa",
  ],
};

const candidates: any[] = [];

for (const [intent, words] of Object.entries(keywords)) {
  const matches = conversations.filter((conversation: any) => {
    const text =
      conversation.customer_message.toLowerCase();

    return words.some((word) =>
      text.includes(word.toLowerCase())
    );
  });

  // Deterministic selection
  const selected = matches
    .slice(0, TARGET_PER_INTENT);

  for (const conversation of selected) {
    candidates.push({
      id: `candidate-${candidates.length + 1}`,
      customer_message:
        conversation.customer_message,

      agent_response:
        conversation.agent_response,

      suggested_intent: intent,

      expected_action: "",
      response_requirements: [],

      source_customer_tweet_id:
        conversation.customer_tweet_id,

      source_agent_tweet_id:
        conversation.agent_tweet_id,
    });
  }
}

fs.mkdirSync(
  "tests/evaluation/amazon",
  { recursive: true }
);

fs.writeFileSync(
  outputPath,
  JSON.stringify(candidates, null, 2)
);

console.log("\n===== GOLDEN CANDIDATES =====");
console.log(
  "Candidates created:",
  candidates.length
);
console.log(
  "Saved to:",
  outputPath
);
console.log("=============================\n");