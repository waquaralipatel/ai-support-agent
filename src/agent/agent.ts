import {
  retrieveFromAmazonVectorStore,
  rerankResults,
} from "../rag/index.js";

import {
  generateSupportResponse,
} from "./llm.js";

import {
  validateResponse,
} from "./validator.js";

import {
  resolvePolicy,
} from "./policy.js";

import {
  classifyIntent,
} from "./classifier.js";

export interface SupportRequest {
  message: string;
  intent?: string;
  expectedAction?: string;
  responseRequirements?: string[];
}

export interface SupportResponse {
  message: string;
  retrievedCount: number;
  topSimilarity: number;
  action: "AUTO_HANDLE" | "ESCALATE";
  escalationRule?: string;
}

const SYSTEM_PROMPT = `
You are an Amazon customer support assistant.

Your job is to provide a helpful, accurate and concise
customer-support response.

Rules:

1. Use the provided support evidence as guidance.
2. Never invent order details, tracking information,
   account information, refunds, replacements, policies,
   or actions.
3. Never expose private information from support examples.
4. Never copy order numbers, tracking numbers, names,
   phone numbers, emails, or other personal information.
5. Never claim that you personally processed a refund,
   cancelled an order, replaced an order, opened an
   investigation, contacted a carrier, or changed an account.
6. If the request requires manual/account/order-level
   assistance, clearly direct the customer to Amazon
   Customer Service.
7. Do not make unsupported promises.
8. Be empathetic and professional.
9. Keep the response concise and useful.
10. Do not mention RAG, embeddings, vector databases,
    retrieved conversations, policies, or internal systems.
11. Return only the customer-facing response.
`;

export async function answerCustomer(
  request: SupportRequest
): Promise<SupportResponse> {
  const classification = await classifyIntent(
    request.message
  );

  const intent =
    request.intent ?? classification.intent;

  const policy = resolvePolicy(intent);

  const retrieved =
    await retrieveFromAmazonVectorStore(
      request.message,
      10
    );

  const ranked = rerankResults(
    retrieved,
    3
  );

  const evidence = ranked
    .map(
      (result, index) =>
        `Evidence ${index + 1}:
Customer: ${result.chunk.question}
Support: ${result.chunk.answer}
Similarity: ${result.score.toFixed(4)}
Relevance: ${result.relevance}`
    )
    .join("\n\n");

  const userPrompt = `
Customer message:
${request.message}

Detected intent:
${intent}

Intent confidence:
${classification.confidence.toFixed(4)}

Policy action:
${policy.action}

Escalation rule:
${policy.escalationRule ?? "NONE"}

Policy reason:
${policy.reason}

Policy rule description:
${policy.ruleDescription ?? "NONE"}

Expected action from evaluation:
${request.expectedAction ?? "Not provided"}

Response requirements:
${
  request.responseRequirements?.join("\n") ??
  "Not provided"
}

Retrieved support evidence:
${evidence || "No sufficiently relevant evidence found."}

Generate the best customer-facing response.

Important:
- If the policy action is ESCALATE, do not pretend that an
  investigation, refund, replacement, cancellation, or
  account change has already been performed.
- Instead, explain the appropriate next step for the customer.
- Do not expose internal policy information.
`;

  const result =
    await generateSupportResponse(
      SYSTEM_PROMPT,
      userPrompt
    );

  const validation = validateResponse(
    result.response,
    request.responseRequirements
  );

  if (!validation.passed) {
    throw new Error(
      `Response validation failed: ${validation.reasons.join("; ")}`
    );
  }

  return {
    message: result.response,
    retrievedCount: ranked.length,
    topSimilarity:
      ranked[0]?.score ?? 0,
    action: policy.action,
    ...(policy.escalationRule
      ? {
          escalationRule:
            policy.escalationRule,
        }
      : {}),
  };
}