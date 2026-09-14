import {
  validateResponse,
} from "../src/agent/index.js";

console.log("\n===== VALIDATOR TEST =====");

const tests = [
  {
    name: "Valid response",
    response:
      "I'm sorry you haven't received your package. Please check around your delivery area and with your neighbors.",
    requirements: ["Be empathetic."],
  },
  {
    name: "Order number leak",
    response:
      "Your order 123-4567890-1234567 is being processed.",
    requirements: [],
  },
  {
    name: "Unsupported refund claim",
    response:
      "I'm sorry. I have processed your refund.",
    requirements: ["Be empathetic."],
  },
];

for (const test of tests) {
  const result = validateResponse(
    test.response,
    test.requirements
  );

  console.log(`\n${test.name}`);
  console.log("Passed:", result.passed);
  console.log("Reasons:", result.reasons);
}

console.log("\n==========================");