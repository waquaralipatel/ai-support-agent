export const AMAZON_INTENTS = [
  {
    id: "ORDER_DELIVERY",
    description:
      "The customer reports a delivery problem such as late, missing, failed, wrong-location, delivered-but-not-received, or damaged delivery.",
  },
  {
    id: "ORDER_STATUS",
    description:
      "The customer primarily asks for order tracking, shipment status, carrier information, or estimated delivery information without reporting a specific delivery failure.",
  },
  {
    id: "RETURNS_REFUNDS",
    description:
      "The customer primarily asks about returning an item, getting a replacement, or receiving a refund.",
  },
  {
    id: "ORDER_CANCELLATION",
    description:
      "The customer wants to cancel an order or asks about an order cancellation.",
  },
  {
    id: "PAYMENT_BILLING",
    description:
      "The customer has a payment, charge, billing, or cashback problem.",
  },
  {
    id: "ACCOUNT_ACCESS",
    description:
      "The customer has a login, password, account-access, or account-management problem.",
  },
  {
    id: "PRIME_MEMBERSHIP",
    description:
      "The customer asks about Prime membership, subscription, membership benefits, eligibility, or membership charges.",
  },
  {
    id: "PRIME_VIDEO",
    description:
      "The customer has a Prime Video streaming, playback, movie, TV-show, or video-content problem.",
  },
  {
    id: "PRODUCT_DEVICE_SUPPORT",
    description:
      "The customer has a problem with an Amazon device or product such as Kindle, Fire TV, Echo, or Alexa.",
  },
  {
    id: "OTHER_SUPPORT",
    description:
      "The customer's issue does not clearly fit any of the defined Amazon support intents.",
  },
] as const;