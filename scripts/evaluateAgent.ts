import "dotenv/config";
import fs from "node:fs";
import path from "node:path";

import { answerCustomer } from "../src/agent/index.js";

interface GoldenExample {
  id?: string;
  customer_message?: string;
  suggested_intent?: string;
  verified_intent?: string;
  expected_action?: string;
  response_requirements?: string[];
  source_agent_response?: string;
  verified?: boolean;
}

interface EvaluationResult {
  id: string;
  message: string;
  expectedIntent: string | null;
  expectedAction: string | null;
  response: string | null;
  retrievedCount: number;
  topSimilarity: number;
  passed: boolean;
  error?: string;
}

const GOLDEN_SET_PATH = path.resolve(
  "tests/evaluation/amazon/golden-set.json"
);

const RESULTS_PATH = path.resolve(
  "tests/evaluation/amazon/agent-evaluation.json"
);

const MAX_LLM_CASES = 10;

function loadGoldenSet(): GoldenExample[] {
  const raw = fs.readFileSync(
    GOLDEN_SET_PATH,
    "utf-8"
  );

  const parsed: unknown = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error("Golden set must contain an array.");
  }

  return parsed as GoldenExample[];
}

async function main(): Promise<void> {
  const goldenSet = loadGoldenSet();

  const candidates = goldenSet
    .filter(
      (example) =>
        typeof example.customer_message === "string" &&
        example.customer_message.trim().length > 0
    )
    .slice(0, MAX_LLM_CASES);

  console.log("\n===== REPRESENTATIVE AGENT EVALUATION =====");
  console.log(`Golden examples available: ${goldenSet.length}`);
  console.log(`LLM test cases selected: ${candidates.length}`);
  console.log(`Maximum Groq calls: ${MAX_LLM_CASES}`);
  console.log("");

  const results: EvaluationResult[] = [];

  let successful = 0;
  let failed = 0;
  let totalSimilarity = 0;

  for (let i = 0; i < candidates.length; i++) {
    const example = candidates[i];

    if (!example || !example.customer_message) {
      continue;
    }

    const message = example.customer_message;

    console.log(`Processing ${i + 1}/${candidates.length}`);
    console.log(`Customer: ${message}`);

    try {
      const request = {
        message,
        ...(example.verified_intent
          ? { intent: example.verified_intent }
          : {}),
        ...(example.expected_action
          ? { expectedAction: example.expected_action }
          : {}),
        responseRequirements:
          example.response_requirements ?? [],
      };

      const response = await answerCustomer(request);

      results.push({
        id: example.id ?? String(i + 1),
        message,
        expectedIntent:
          example.verified_intent ?? null,
        expectedAction:
          example.expected_action ?? null,
        response: response.message,
        retrievedCount: response.retrievedCount,
        topSimilarity: response.topSimilarity,
        passed: true,
      });

      successful++;
      totalSimilarity += response.topSimilarity;

      console.log("Result: SUCCESS");
      console.log(
        `Top similarity: ${response.topSimilarity.toFixed(4)}`
      );
      console.log("");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : String(error);

      console.error(`Result: FAILED`);
      console.error(`Error: ${errorMessage}`);
      console.error("");

      results.push({
        id: example.id ?? String(i + 1),
        message,
        expectedIntent:
          example.verified_intent ?? null,
        expectedAction:
          example.expected_action ?? null,
        response: null,
        retrievedCount: 0,
        topSimilarity: 0,
        passed: false,
        error: errorMessage,
      });

      failed++;

      if (
        errorMessage.includes("429") ||
        errorMessage.toLowerCase().includes("quota") ||
        errorMessage.toLowerCase().includes("rate limit")
      ) {
        console.log(
          "Groq quota/rate limit reached."
        );
        console.log(
          "Stopping evaluation to avoid additional API calls."
        );
        break;
      }
    }
  }

  fs.mkdirSync(
    path.dirname(RESULTS_PATH),
    { recursive: true }
  );

  fs.writeFileSync(
    RESULTS_PATH,
    JSON.stringify(results, null, 2),
    "utf-8"
  );

  const evaluated = successful + failed;

  const successRate =
    evaluated > 0
      ? (successful / evaluated) * 100
      : 0;

  const averageSimilarity =
    successful > 0
      ? totalSimilarity / successful
      : 0;

  console.log("\n===== RESULTS =====");
  console.log(
    `Successful: ${successful}/${evaluated}`
  );
  console.log(
    `Failed: ${failed}/${evaluated}`
  );
  console.log(
    `Execution success rate: ${successRate.toFixed(2)}%`
  );
  console.log(
    `Average top similarity: ${averageSimilarity.toFixed(4)}`
  );
  console.log(`Saved to: ${RESULTS_PATH}`);
  console.log("===================\n");
}

main().catch((error) => {
  console.error("\nEvaluation failed:");
  console.error(error);
  process.exit(1);
});