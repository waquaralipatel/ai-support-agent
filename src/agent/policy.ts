import { AMAZON_ACTION_POLICY } from "../config/amazon/actionPolicy.js";
import { AMAZON_ESCALATION_RULES } from "../config/amazon/escalationRules.js";

export type SupportAction =
  | "AUTO_HANDLE"
  | "ESCALATE";

export interface PolicyDecision {
  action: SupportAction;
  escalationRule?: string;
  reason: string;
  ruleDescription?: string;
}

export function resolvePolicy(
  intent: string
): PolicyDecision {
  if (
    AMAZON_ACTION_POLICY.ESCALATE.includes(
      intent as (typeof AMAZON_ACTION_POLICY.ESCALATE)[number]
    )
  ) {
    const escalationRule =
      getEscalationRule(intent);

    const rule =
      AMAZON_ESCALATION_RULES.rules.find(
        (item) => item.id === escalationRule
      );

    return {
      action: "ESCALATE",
      escalationRule,
      reason:
        "This issue requires account/order-level or manual support assistance.",
      ruleDescription:
        rule?.description ?? "",
    };
  }

  if (
    AMAZON_ACTION_POLICY.AUTO_HANDLE.includes(
      intent as (typeof AMAZON_ACTION_POLICY.AUTO_HANDLE)[number]
    )
  ) {
    return {
      action: "AUTO_HANDLE",
      reason:
        "This issue can be handled using available support guidance.",
    };
  }

  const rule =
    AMAZON_ESCALATION_RULES.rules.find(
      (item) =>
        item.id === "UNSUPPORTED_REQUEST"
    );

  return {
    action: "ESCALATE",
    escalationRule: "UNSUPPORTED_REQUEST",
    reason:
      "This request cannot be safely handled using the available support capabilities.",
    ruleDescription:
      rule?.description ?? "",
  };
}

function getEscalationRule(
  intent: string
): string {
  switch (intent) {
    case "ACCOUNT_ACCESS":
      return "ACCOUNT_SECURITY";

    case "PAYMENT_BILLING":
      return "PAYMENT_DISPUTE";

    case "RETURNS_REFUNDS":
      return "REFUND_EXCEPTION";

    case "ORDER_DELIVERY":
    case "ORDER_CANCELLATION":
      return "ORDER_INVESTIGATION";

    default:
      return "UNSUPPORTED_REQUEST";
  }
}

export function getEscalationDescription(
  ruleId: string
): string {
  const rule =
    AMAZON_ESCALATION_RULES.rules.find(
      (item) => item.id === ruleId
    );

  return rule?.description ?? "";
}