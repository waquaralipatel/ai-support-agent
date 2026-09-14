import fs from "fs";
import { parse } from "csv-parse";

const filePath = "data/raw/twcs.csv";

const authorCounts = new Map<string, number>();

const parser = fs.createReadStream(filePath).pipe(
  parse({
    columns: true,
    skip_empty_lines: true,
  })
);

let totalRows = 0;

for await (const row of parser) {
  totalRows++;

  const authorId = row.author_id;

  if (authorId) {
    authorCounts.set(
      authorId,
      (authorCounts.get(authorId) || 0) + 1
    );
  }
}

console.log("\nTotal rows:", totalRows);

console.log("\nTop 50 author IDs:\n");

const results = [...authorCounts.entries()]
  .sort((a, b) => b[1] - a[1])
  .slice(0, 50);

for (const [authorId, count] of results) {
  console.log(`${authorId} -> ${count}`);
}