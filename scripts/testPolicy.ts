import {
  resolvePolicy,
  getEscalationDescription,
} from "../src/agent/policy.js";

const intents = [
  "ORDER_DELIVERY",
  "ORDER_STATUS",
  "ACCOUNT_ACCESS",
  "RETURNS_REFUNDS",
  "PAYMENT_BILLING",
  "PRIME_VIDEO",
  "PRODUCT_DEVICE_SUPPORT",
];

console.log("\n===== POLICY TEST =====\n");

for (const intent of intents) {
  const decision = resolvePolicy(intent);

  console.log(`Intent: ${intent}`);
  console.log(`Action: ${decision.action}`);
  console.log(
    `Escalation rule: ${decision.escalationRule ?? "NONE"}`
  );
  console.log(`Reason: ${decision.reason}`);

  if (decision.escalationRule) {
    console.log(
      `Rule description: ${getEscalationDescription(
        decision.escalationRule
      )}`
    );
  }

  console.log("--------------------------------");
}