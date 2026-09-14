export type ValidationResult = {
  passed: boolean;
  reasons: string[];
};

export function validateResponse(
  response: string,
  requirements: string[] = []
): ValidationResult {
  const reasons: string[] = [];
  const normalized = response.toLowerCase();

  if (!response.trim()) {
    reasons.push("Response is empty.");
  }

  const orderNumberPattern =
    /\b\d{3}-\d{7}-\d{7}\b/;

  if (orderNumberPattern.test(response)) {
    reasons.push(
      "Response contains an order number."
    );
  }

  const trackingNumberPatterns = [
    /\b1z[0-9a-z]{16}\b/i,
    /\btba[0-9]{10,}\b/i,
    /\b9[0-9]{19,}\b/,
  ];

  if (
    trackingNumberPatterns.some((pattern) =>
      pattern.test(response)
    )
  ) {
    reasons.push(
      "Response contains a tracking number."
    );
  }

  const phonePattern =
    /(?:\+?\d[\d\s().-]{7,}\d)/;

  if (phonePattern.test(response)) {
    reasons.push(
      "Response contains an unsupported phone number."
    );
  }

  const unsupportedActionPatterns = [
    "i have issued your refund",
    "i have processed your refund",
    "your refund has been processed",
    "i have cancelled your order",
    "i have replaced your order",
    "i opened an investigation",
    "we opened an investigation",
    "we have opened an investigation",
    "we can open an investigation",
    "we will open an investigation",
    "amazon will open an investigation",
    "we can investigate this",
    "we will investigate this",
    "i contacted the carrier",
    "we contacted the carrier",
    "i have contacted the carrier",
    "we have contacted the carrier",
    "i have arranged a replacement",
    "we have arranged a replacement",
  ];

  for (const phrase of unsupportedActionPatterns) {
    if (normalized.includes(phrase)) {
      reasons.push(
        "Response claims an action that the system cannot directly perform."
      );
      break;
    }
  }

  for (const requirement of requirements) {
    const requirementLower =
      requirement.toLowerCase();

    if (
      requirementLower.includes("empathetic") &&
      !containsEmpathy(normalized)
    ) {
      reasons.push(
        "Response does not appear sufficiently empathetic."
      );
    }

    if (
      requirementLower.includes("next step") &&
      !containsNextStep(normalized)
    ) {
      reasons.push(
        "Response does not provide a clear next step."
      );
    }
  }

  return {
    passed: reasons.length === 0,
    reasons,
  };
}

function containsEmpathy(
  text: string
): boolean {
  const phrases = [
    "sorry",
    "apologize",
    "understand",
    "unfortunately",
    "frustrating",
    "appreciate",
  ];

  return phrases.some((phrase) =>
    text.includes(phrase)
  );
}

function containsNextStep(
  text: string
): boolean {
  const phrases = [
    "please",
    "contact",
    "check",
    "visit",
    "go to",
    "try",
    "reach out",
    "customer service",
  ];

  return phrases.some((phrase) =>
    text.includes(phrase)
  );
}