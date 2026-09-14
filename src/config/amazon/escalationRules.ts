export const AMAZON_ESCALATION_RULES = {
  rules: [
    {
      id: "ACCOUNT_SECURITY",
      description:
        "Escalate issues involving account security, unauthorized access, or sensitive account changes.",
    },
    {
      id: "PAYMENT_DISPUTE",
      description:
        "Escalate disputed, unauthorized, or unresolved payment and billing issues.",
    },
    {
      id: "REFUND_EXCEPTION",
      description:
        "Escalate refund cases that require manual investigation or cannot be resolved through standard guidance.",
    },
    {
      id: "ORDER_INVESTIGATION",
      description:
        "Escalate missing, failed, or exceptional orders that require account or order-level investigation.",
    },
    {
      id: "CUSTOMER_REQUESTS_HUMAN",
      description:
        "Escalate when the customer explicitly requests a human agent or manual assistance.",
    },
    {
      id: "UNSUPPORTED_REQUEST",
      description:
        "Escalate requests that cannot be safely handled using the available knowledge and support capabilities.",
    },
  ],
} as const;