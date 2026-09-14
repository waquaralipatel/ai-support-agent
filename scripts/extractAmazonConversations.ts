import fs from "fs";
import { parse } from "csv-parse";

const filePath = "data/raw/twcs.csv";
const outputPath = "data/processed/amazon_conversations.json";

const tweets = new Map<string, any>();

const parser = fs.createReadStream(filePath).pipe(
  parse({
    columns: true,
    skip_empty_lines: true,
  })
);

// First pass: store tweets needed for conversation reconstruction
for await (const row of parser) {
  tweets.set(row.tweet_id, row);
}

console.log("Total tweets loaded:", tweets.size);

const conversations: any[] = [];

for (const tweet of tweets.values()) {
  // We only want AmazonHelp responses
  if (tweet.author_id !== "AmazonHelp") {
    continue;
  }

  const parentId = tweet.in_response_to_tweet_id;

  if (!parentId) {
    continue;
  }

  const customerTweet = tweets.get(parentId);

  if (!customerTweet) {
    continue;
  }

  // Make sure the parent tweet is from a customer
  if (customerTweet.author_id === "AmazonHelp") {
    continue;
  }

  conversations.push({
    customer_tweet_id: customerTweet.tweet_id,
    customer_id: customerTweet.author_id,
    customer_message: customerTweet.text,

    agent_tweet_id: tweet.tweet_id,
    agent: "AmazonHelp",
    agent_response: tweet.text,

    created_at_customer: customerTweet.created_at,
    created_at_agent: tweet.created_at,
  });
}

fs.mkdirSync("data/processed", { recursive: true });

fs.writeFileSync(
  outputPath,
  JSON.stringify(conversations, null, 2)
);

console.log("\n===== AMAZON CONVERSATIONS =====");
console.log("Conversation pairs:", conversations.length);
console.log("Saved to:", outputPath);
console.log("================================\n");

console.log("First 5 conversations:\n");

console.log(
  JSON.stringify(conversations.slice(0, 5), null, 2)
);