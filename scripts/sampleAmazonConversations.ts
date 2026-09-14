import fs from "fs";

const inputPath = "data/processed/amazon_clean.json";

const conversations = JSON.parse(
  fs.readFileSync(inputPath, "utf-8")
);

// Fixed seed so we always get the same evaluation sample
let seed = 42;

function random() {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
}

const shuffled = [...conversations].sort(() => random() - 0.5);

// Take 300 examples for manual inspection
const sample = shuffled.slice(0, 300);

fs.writeFileSync(
  "data/processed/amazon_sample_300.json",
  JSON.stringify(sample, null, 2)
);

console.log("Total conversations:", conversations.length);
console.log("Sample created:", sample.length);
console.log(
  "Saved to: data/processed/amazon_sample_300.json"
);