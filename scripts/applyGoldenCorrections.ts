import fs from "fs";

const inputPath =
  "tests/evaluation/amazon/golden-verification.json";

const outputPath =
  "tests/evaluation/amazon/golden-set.json";

const goldenSet = JSON.parse(
  fs.readFileSync(inputPath, "utf-8")
);

// Verified corrections for candidates 1–180
const corrections: Record<number, string> = {
  // Candidates 1–60
  21: "ORDER_DELIVERY",
  23: "ORDER_DELIVERY",
  25: "ORDER_DELIVERY",
  27: "ORDER_DELIVERY",
  28: "RETURNS_REFUNDS",
  30: "ORDER_DELIVERY",
  31: "ORDER_DELIVERY",
  37: "RETURNS_REFUNDS",
  38: "RETURNS_REFUNDS",
  43: "ORDER_DELIVERY",

  // Candidates 61–120
  62: "ACCOUNT_ACCESS",
  63: "PRIME_MEMBERSHIP",
  64: "PRIME_MEMBERSHIP",
  65: "PRIME_MEMBERSHIP",
  66: "RETURNS_REFUNDS",
  69: "PRIME_MEMBERSHIP",
  71: "PRIME_MEMBERSHIP",
  75: "RETURNS_REFUNDS",
  77: "PRIME_MEMBERSHIP",
  78: "RETURNS_REFUNDS",
  79: "RETURNS_REFUNDS",
  80: "ACCOUNT_ACCESS",

  81: "ACCOUNT_ACCESS",
  82: "ORDER_DELIVERY",
  83: "PRIME_MEMBERSHIP",
  84: "PRIME_MEMBERSHIP",
  85: "PRIME_MEMBERSHIP",
  87: "RETURNS_REFUNDS",
  88: "RETURNS_REFUNDS",
  90: "RETURNS_REFUNDS",
  91: "RETURNS_REFUNDS",
  92: "PRIME_MEMBERSHIP",
  93: "PRIME_MEMBERSHIP",
  94: "PRIME_MEMBERSHIP",
  95: "PRIME_MEMBERSHIP",
  96: "RETURNS_REFUNDS",

  101: "ACCOUNT_ACCESS",
  102: "PRODUCT_DEVICE_SUPPORT",
  104: "ACCOUNT_ACCESS",
  106: "PRODUCT_DEVICE_SUPPORT",
  114: "ACCOUNT_ACCESS",

  // Candidates 121–180
  122: "OTHER_SUPPORT",
  123: "ORDER_DELIVERY",
  124: "ORDER_DELIVERY",
  125: "ORDER_DELIVERY",
  126: "ORDER_CANCELLATION",
  127: "OTHER_SUPPORT",
  128: "RETURNS_REFUNDS",
  129: "ORDER_DELIVERY",
  130: "RETURNS_REFUNDS",
  131: "ORDER_DELIVERY",
  132: "PAYMENT_BILLING",
  133: "PAYMENT_BILLING",
  134: "PAYMENT_BILLING",
  135: "ORDER_DELIVERY",
  136: "ORDER_DELIVERY",
  137: "ORDER_DELIVERY",
  138: "OTHER_SUPPORT",
  139: "PRIME_MEMBERSHIP",
  140: "PRIME_MEMBERSHIP",

  141: "OTHER_SUPPORT",
  142: "PRIME_MEMBERSHIP",
  143: "PRIME_VIDEO",
  144: "PRIME_VIDEO",
  145: "PRIME_VIDEO",
  146: "PRIME_VIDEO",
  147: "PRIME_VIDEO",
  148: "PRIME_VIDEO",
  149: "PRIME_VIDEO",
  150: "PRIME_VIDEO",
  151: "PRODUCT_DEVICE_SUPPORT",
  152: "PRODUCT_DEVICE_SUPPORT",
  153: "PRIME_VIDEO",
  154: "PRIME_VIDEO",
  155: "PRIME_VIDEO",
  156: "PRIME_VIDEO",
  157: "PRIME_VIDEO",
  158: "PRIME_VIDEO",
  159: "PRODUCT_DEVICE_SUPPORT",
  160: "PRIME_VIDEO",

  162: "PRODUCT_DEVICE_SUPPORT",
  163: "PRODUCT_DEVICE_SUPPORT",
  164: "PRODUCT_DEVICE_SUPPORT",
  165: "PRODUCT_DEVICE_SUPPORT",
  166: "PRODUCT_DEVICE_SUPPORT",
  167: "OTHER_SUPPORT",
  168: "PRODUCT_DEVICE_SUPPORT",
  169: "ORDER_DELIVERY",
  170: "PRODUCT_DEVICE_SUPPORT",
  171: "RETURNS_REFUNDS",
  172: "PRODUCT_DEVICE_SUPPORT",
  173: "PRODUCT_DEVICE_SUPPORT",
  174: "PRODUCT_DEVICE_SUPPORT",
  175: "PRODUCT_DEVICE_SUPPORT",
  176: "PRODUCT_DEVICE_SUPPORT",
  177: "PRODUCT_DEVICE_SUPPORT",
  178: "OTHER_SUPPORT",
  179: "PRODUCT_DEVICE_SUPPORT",
  180: "PRODUCT_DEVICE_SUPPORT",
};

let verifiedCount = 0;

for (const item of goldenSet) {
  const number = parseInt(
    item.id.replace("candidate-", ""),
    10
  );

  if (number <= 180) {
    item.verified_intent =
      corrections[number] || item.suggested_intent;

    item.verified = true;

    verifiedCount++;
  }
}

fs.writeFileSync(
  outputPath,
  JSON.stringify(goldenSet, null, 2)
);

console.log("\n===== GOLDEN CORRECTIONS APPLIED =====");
console.log("Verified candidates:", verifiedCount);
console.log("Total Golden candidates:", goldenSet.length);
console.log("Saved to:", outputPath);
console.log("======================================\n");