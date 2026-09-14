import fs from "fs";

const inputPath = "data/processed/amazon_conversations.json";
const outputPath = "data/processed/amazon_clean.json";

const conversations = JSON.parse(
  fs.readFileSync(inputPath, "utf-8")
);

const cleaned: any[] = [];

let removedEmpty = 0;
let removedShort = 0;
let removedThanks = 0;
let removedInvalid = 0;

const trivialPatterns = [
  /^thanks[.! ]*$/i,
  /^thank you[.! ]*$/i,
  /^thx[.! ]*$/i,
  /^ok[.! ]*$/i,
  /^okay[.! ]*$/i,
  /^great[.! ]*$/i,
  /^awesome[.! ]*$/i,
  /^cool[.! ]*$/i,
  /^perfect[.! ]*$/i,
];

function cleanText(text: string): string {
  return text
    // Remove Twitter mentions
    .replace(/@\w+/g, "")

    // Remove URLs
    .replace(/https?:\/\/\S+/gi, "")

    // Remove HTML entities
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&amp;/g, "&")

    // Normalize whitespace
    .replace(/\s+/g, " ")

    .trim();
}

for (const conversation of conversations) {
  if (
    !conversation.customer_message ||
    !conversation.agent_response
  ) {
    removedEmpty++;
    continue;
  }

  const customerMessage = cleanText(
    conversation.customer_message
  );

  const agentResponse = cleanText(
    conversation.agent_response
  );

  if (!customerMessage || !agentResponse) {
    removedEmpty++;
    continue;
  }

  if (customerMessage.length < 5) {
    removedShort++;
    continue;
  }

  const isTrivial = trivialPatterns.some((pattern) =>
    pattern.test(customerMessage)
  );

  if (isTrivial) {
    removedThanks++;
    continue;
  }

  if (agentResponse.length < 10) {
    removedInvalid++;
    continue;
  }

  cleaned.push({
    customer_message: customerMessage,
    agent_response: agentResponse,

    customer_tweet_id: conversation.customer_tweet_id,
    agent_tweet_id: conversation.agent_tweet_id,

    created_at_customer:
      conversation.created_at_customer,

    created_at_agent:
      conversation.created_at_agent,

    brand: "Amazon",
  });
}

fs.writeFileSync(
  outputPath,
  JSON.stringify(cleaned, null, 2)
);

console.log("\n===== CLEANING COMPLETE =====");

console.log(
  "Original conversations:",
  conversations.length
);

console.log(
  "Clean conversations:",
  cleaned.length
);

console.log(
  "Removed empty:",
  removedEmpty
);

console.log(
  "Removed short:",
  removedShort
);

console.log(
  "Removed trivial:",
  removedThanks
);

console.log(
  "Removed invalid:",
  removedInvalid
);

console.log(
  "Total removed:",
  conversations.length - cleaned.length
);

console.log(
  "Saved to:",
  outputPath
);

console.log("============================\n");