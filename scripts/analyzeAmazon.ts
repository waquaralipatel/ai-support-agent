import fs from "fs";
import { parse } from "csv-parse";

const filePath = "data/raw/twcs.csv";

let totalAmazonRows = 0;
let inboundRows = 0;
let outboundRows = 0;

const responseCounts = new Map<string, number>();

const parser = fs.createReadStream(filePath).pipe(
  parse({
    columns: true,
    skip_empty_lines: true,
  })
);

for await (const row of parser) {
  // Only AmazonHelp conversations
  if (row.author_id !== "AmazonHelp") {
    continue;
  }

  totalAmazonRows++;

  if (row.inbound === "True") {
    inboundRows++;
  } else {
    outboundRows++;
  }

  if (row.in_response_to_tweet_id) {
    const parentId = row.in_response_to_tweet_id;

    responseCounts.set(
      parentId,
      (responseCounts.get(parentId) || 0) + 1
    );
  }
}

console.log("\n===== AMAZON ANALYSIS =====");

console.log("Total Amazon rows:", totalAmazonRows);
console.log("Amazon outbound/support rows:", outboundRows);
console.log("Amazon inbound rows:", inboundRows);

console.log(
  "Amazon responses linked to another tweet:",
  responseCounts.size
);

console.log("===========================\n");