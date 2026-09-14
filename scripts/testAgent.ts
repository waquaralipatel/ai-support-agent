import {
  answerCustomer,
} from "../src/agent/index.js";

const request = {
  message:
    "My package was delivered but I did not receive it.",
  intent: "ORDER_DELIVERY",
  expectedAction:
    "Help the customer investigate a delivered-but-not-received package.",
  responseRequirements: [
    "Be empathetic.",
    "Do not request public personal information.",
    "Provide an appropriate next step.",
  ],
};

console.log("\n===== AI SUPPORT AGENT TEST =====");

const response =
  await answerCustomer(request);

console.log("\nCustomer:");
console.log(request.message);

console.log("\nAgent:");
console.log(response.message);

console.log(
  "\nRetrieved evidence:",
  response.retrievedCount
);

console.log(
  "Top similarity:",
  response.topSimilarity.toFixed(4)
);

console.log("\n=================================\n");