# AI Support Agent --- Amazon

## 1. Overview

This project implements an AI customer-support agent for **Amazon**,
using real customer-support conversations from the Customer Support on
Twitter dataset.

The system is designed around three core requirements from the Hiver SDE
Intern take-home assignment:

1.  Classify an incoming customer message into a small set of support
    intents.
2.  Draft a response grounded in historically similar Amazon support
    conversations.
3.  Decide whether the request can be auto-handled or should be
    escalated to a human, with a reason.

The implementation deliberately separates retrieval, intent
classification, policy decisions, generation, and validation so that the
system is easier to test and reason about.

------------------------------------------------------------------------

## 2. What "good" means for this agent

For an Amazon support agent, a good response should be:

-   Relevant to the customer's actual problem.
-   Grounded in historically observed Amazon support behavior.
-   Empathetic and concise.
-   Safe: it must not invent order, account, payment, tracking, refund,
    replacement, or delivery information.
-   Honest about system capabilities.
-   Able to recognize cases that require account/order-level
    investigation or human assistance.
-   Useful even when the retrieved evidence is imperfect.

The system prioritizes **safe and grounded assistance over pretending to
complete actions it cannot actually perform**.

### What was intentionally not built

This is a support-assistance prototype rather than a production Amazon
backend integration. It does not:

-   Access live Amazon orders.
-   Access customer accounts.
-   Query live carrier tracking.
-   Process refunds or replacements.
-   Cancel orders.
-   Modify accounts.
-   Open real carrier investigations.
-   Provide a customer-facing web UI or production API.

These capabilities would require authenticated production integrations
and are outside the scope of the assignment prototype.

------------------------------------------------------------------------

## 3. High-level architecture

``` text
Customer Message
      |
      v
+-----------------------+
| Intent Classifier     |
| MiniLM embeddings     |
+-----------+-----------+
            |
            | intent + confidence
            v
+-----------------------+
| Policy Engine         |
| AUTO_HANDLE/ESCALATE  |
+-----------+-----------+
            |
            v
+-----------------------+
| Vector Retrieval      |
| Amazon knowledge      |
+-----------+-----------+
            |
            v
+-----------------------+
| Reranker              |
| Top relevant evidence |
+-----------+-----------+
            |
            v
+-----------------------+
| Groq LLM              |
| Customer response     |
+-----------+-----------+
            |
            v
+-----------------------+
| Response Validator    |
+-----------+-----------+
            |
            v
     Final response
```

### Main implementation components

``` text
src/
├── agent/
│   ├── agent.ts
│   ├── classifier.ts
│   ├── index.ts
│   ├── llm.ts
│   ├── policy.ts
│   └── validator.ts
│
├── config/
│   └── amazon/
│       ├── actionPolicy.ts
│       ├── escalationRules.ts
│       └── intents.ts
│
└── rag/
    ├── chunker.ts
    ├── documents.ts
    ├── embedding.ts
    ├── index.ts
    ├── reranker.ts
    ├── retriever.ts
    ├── vectorRetriever.ts
    └── vectorStore.ts
```

------------------------------------------------------------------------

## 4. Dataset and knowledge preparation

The primary dataset is the **Customer Support on Twitter** dataset,
containing real customer-support conversations across multiple brands.

Amazon conversations were extracted and cleaned before building the
support knowledge base.

The project contains scripts for:

-   Amazon conversation extraction.
-   Brand conversation analysis.
-   Cleaning noisy conversations.
-   Sampling.
-   Knowledge-base construction.
-   Vector-index construction.
-   Golden-set creation and correction.
-   Retrieval evaluation.
-   Agent evaluation.

Important processing scripts include:

``` text
scripts/extractAmazonConversations.ts
scripts/cleanBrandConversations.ts
scripts/buildAmazonKnowledge.ts
scripts/buildAmazonVectorIndex.ts
scripts/analyzeAmazon.ts
scripts/analyzeDataset.ts
```

The system uses the resulting Amazon support knowledge rather than
treating the raw dataset as directly usable prompts.

------------------------------------------------------------------------

## 5. Retrieval-Augmented Generation

### Embeddings

The local embedding model is:

``` text
Xenova/all-MiniLM-L6-v2
```

Embeddings are normalized and generated using mean pooling.

This keeps retrieval independent of the generation provider and avoids
spending LLM/API quota merely to create embeddings.

### Retrieval pipeline

The agent:

1.  Embeds the customer message.
2.  Retrieves candidate Amazon support examples.
3.  Reranks the candidates.
4.  Keeps the top three results as generation evidence.
5.  Passes the evidence to the Groq model.

The generated answer is therefore based on retrieved historical support
behavior instead of relying only on the LLM's general knowledge.

### Example observed retrieval

For:

> My package was delivered but I did not receive it.

the agent retrieved:

``` text
Retrieved evidence: 3
Top similarity: 0.7356
```

This demonstrates that the delivery issue maps to relevant historical
support evidence.

------------------------------------------------------------------------

## 6. Intent classification

The project defines a compact Amazon-specific intent taxonomy:

``` text
ORDER_DELIVERY
ORDER_STATUS
RETURNS_REFUNDS
ORDER_CANCELLATION
PAYMENT_BILLING
ACCOUNT_ACCESS
PRIME_MEMBERSHIP
PRIME_VIDEO
PRODUCT_DEVICE_SUPPORT
OTHER_SUPPORT
```

The classifier in `src/agent/classifier.ts` embeds both:

-   the incoming customer message, and
-   each intent's ID + description.

It then selects the intent with the highest cosine similarity.

This is a lightweight semantic classifier and does not require an
additional LLM call.

The classifier returns:

``` text
intent
confidence
```

The agent can still accept an externally supplied intent for
evaluation/backward compatibility, while normal operation can classify
the message automatically.

------------------------------------------------------------------------

## 7. Policy and escalation

The policy engine maps intents to actions.

### Auto-handled intents

``` text
ORDER_STATUS
PRIME_MEMBERSHIP
PRIME_VIDEO
PRODUCT_DEVICE_SUPPORT
OTHER_SUPPORT
```

### Escalated intents

``` text
ACCOUNT_ACCESS
PAYMENT_BILLING
RETURNS_REFUNDS
ORDER_CANCELLATION
ORDER_DELIVERY
```

Examples:

``` text
ORDER_DELIVERY
    -> ESCALATE
    -> ORDER_INVESTIGATION

ACCOUNT_ACCESS
    -> ESCALATE
    -> ACCOUNT_SECURITY

PAYMENT_BILLING
    -> ESCALATE
    -> PAYMENT_DISPUTE

RETURNS_REFUNDS
    -> ESCALATE
    -> REFUND_EXCEPTION
```

An unsupported intent falls back to:

``` text
UNSUPPORTED_REQUEST
```

The policy decision is deterministic and separate from the LLM, which
prevents the model from independently deciding whether a sensitive
action should be automated.

------------------------------------------------------------------------

## 8. Response safety and validation

The system prompt explicitly prevents the model from claiming that it
has:

-   processed a refund,
-   cancelled an order,
-   replaced an order,
-   opened an investigation,
-   contacted a carrier,
-   changed an account.

For escalation cases, the model must instead explain the appropriate
next step for the customer.

The validator then checks the generated response against the supplied
response requirements.

This separation is important because the LLM generates language, while
the application remains responsible for enforcing system-level
constraints.

------------------------------------------------------------------------

## 9. LLM implementation

The current generation provider is **Groq** using:

``` text
openai/gpt-oss-120b
```

Generation is configured with a low temperature:

``` text
temperature: 0.2
```

The lower temperature is intended to reduce unnecessary variation in
customer-support responses.

The LLM is used only for response generation. Embedding and intent
classification are performed locally.

------------------------------------------------------------------------

## 10. Evaluation design

### Golden evaluation set

The project contains:

``` text
180
```

golden examples.

This is within the assignment's requested range of 150--250 examples.

The evaluation data includes customer messages, intent information,
expected action information, response requirements, and source-agent
responses where available.

Relevant scripts include:

``` text
scripts/createGoldenCandidates.ts
scripts/labelGoldenCandidates.ts
scripts/prepareGoldenVerification.ts
scripts/applyGoldenActions.ts
scripts/applyGoldenCorrections.ts
```

### Representative agent evaluation

Because LLM API quotas are limited, the evaluation harness deliberately
selects representative cases rather than attempting to run the complete
golden set through the LLM.

The current evaluation selected:

``` text
Golden examples available: 180
LLM test cases selected: 10
```

The selection strategy first chooses one representative example per
intent and then fills remaining slots from the golden set.

This provides coverage across the intent taxonomy while controlling API
usage.

------------------------------------------------------------------------

## 11. Headline evaluation result

Latest representative evaluation:

``` text
Successful:              9/10
Failed:                  1/10
Execution success rate:  90.00%
Average top similarity:  0.7798
```

The ten cases covered several delivery-related and miscellaneous support
scenarios.

The observed top similarities were:

``` text
0.6701
0.8757
0.7391
0.8157
0.8399
FAILED
0.6499
0.8590
0.7186
0.8505
```

The result demonstrates that the pipeline executes successfully on the
representative set and generally retrieves relevant historical support
evidence.

------------------------------------------------------------------------

## 12. Failure analysis

One of the ten representative cases failed validation:

> Item has not been delivered but tracking says it was handed to me over
> an hour ago... 2nd time this has happened. Sort it out

Observed failure:

``` text
Response validation failed:
Response claims an action that the system cannot directly perform.
```

### Failure mode 1 --- Unsupported action claim

The generated response attempted to describe an action that the
application cannot actually perform.

**Why this matters:**\
A customer-support agent should never imply that it has performed an
account/order-level operation when it only generates text.

**Mitigation implemented:**

-   Explicit system-prompt restrictions.
-   Explicit escalation instructions.
-   Response validation.
-   Deterministic policy decisions outside the LLM.

### Failure mode 2 --- Retrieval variation

Some representative cases produced lower top similarity scores, such as
approximately:

``` text
0.6499
0.6701
```

**Hypothesis:**\
Real customer-support messages are noisy, informal, sarcastic,
abbreviated, and sometimes contain multiple issues.

**Mitigation:**\
Candidate retrieval is followed by reranking, and the generation step
receives the top three evidence items rather than relying on one nearest
neighbor.

### Failure mode 3 --- Ambiguous/noisy customer language

The dataset contains messages that may be humorous, sarcastic,
incomplete, or difficult to map to a specific support intent.

**Mitigation:**\
The taxonomy includes `OTHER_SUPPORT`, and the policy layer contains an
`UNSUPPORTED_REQUEST` fallback.

### Failure mode 4 --- Account-level context is unavailable

Some customer requests cannot be resolved from conversation text alone
because the real answer depends on an order, account, payment, or
tracking record.

**Mitigation:**\
These intents are routed toward escalation rather than fabricated
resolution.

### Failure mode 5 --- LLM variability

Even with grounding and a low temperature, generated wording can
occasionally cross a system capability boundary.

**Mitigation:**\
Generation is followed by deterministic validation.

------------------------------------------------------------------------

## 13. What is misleading about the headline number?

The **90% execution success rate should not be interpreted as 90%
customer-support accuracy**.

It is based on only **10 representative LLM cases**, selected from a
larger 180-example golden set.

The metric also combines multiple concerns:

-   retrieval quality,
-   response generation,
-   response validation,
-   and successful end-to-end execution.

It does **not** establish that 90% of all Amazon customer messages would
receive a correct response.

The evaluation was intentionally limited because the LLM provider's
free-tier request quota was reached during earlier evaluation work.

Therefore, the more useful interpretation is:

> The current pipeline successfully completed 9 of 10 representative
> end-to-end LLM cases, while retrieval produced an average top
> similarity of 0.7798. A larger, independently judged run would be
> required before making a strong claim about production-level response
> quality.

------------------------------------------------------------------------

## 14. Baselines

The assignment asks for comparison against at least two baselines.

The project includes separate retrieval/evaluation tooling:

``` text
scripts/evaluateRetrieval.ts
```

For a reproducible comparison, the intended baselines are:

### Baseline 1 --- Trivial baseline

Always predict:

``` text
OTHER_SUPPORT
```

This establishes the performance floor for intent classification.

### Baseline 2 --- Simple lexical baseline

Classify using keyword/rule matching for common support terms, for
example:

``` text
delivery / delivered / package -> ORDER_DELIVERY
refund / return               -> RETURNS_REFUNDS
payment / charged             -> PAYMENT_BILLING
login / password              -> ACCOUNT_ACCESS
```

This establishes a simple non-semantic baseline against which the
embedding-based classifier can be compared.

The implemented agent improves on these baselines conceptually by using
semantic similarity rather than relying only on exact keywords.

**Important:** numeric baseline scores are not claimed here because a
completed baseline run is not included in the verified results available
for this submission. Fabricating those numbers would make the report
misleading.

------------------------------------------------------------------------

## 15. Reproducibility

### Requirements

-   Node.js
-   npm
-   TypeScript/tsx
-   A Groq API key for LLM generation

Create a `.env` file:

``` env
GROQ_API_KEY=your_key_here
```

Do **not** commit `.env` or API keys.

### Install

``` bash
npm install
```

### Type-check

``` bash
npx tsc --noEmit
```

Expected result:

``` text
No TypeScript errors
```

### Test policy

``` bash
npx tsx scripts/testPolicy.ts
```

### Test the agent

``` bash
npx tsx scripts/testAgent.ts
```

This invokes the LLM and therefore consumes Groq quota.

### Representative evaluation

``` bash
npx tsx scripts/evaluateAgent.ts
```

The current evaluation harness limits the LLM run to:

``` text
10 representative cases
```

The result is written to:

``` text
tests/evaluation/amazon/agent-evaluation.json
```

------------------------------------------------------------------------

## 16. Current verification status

The latest verified checks are:

``` text
TypeScript compilation        PASS
Policy engine                 PASS
Intent classification         IMPLEMENTED
RAG retrieval                 PASS
Reranking                     PASS
Groq generation               PASS
Response validation           PASS
Golden set                    180 examples
Representative evaluation    9/10
Average top similarity        0.7798
```

The policy test successfully verified mappings including:

``` text
ORDER_DELIVERY      -> ESCALATE / ORDER_INVESTIGATION
ORDER_STATUS        -> AUTO_HANDLE
ACCOUNT_ACCESS      -> ESCALATE / ACCOUNT_SECURITY
RETURNS_REFUNDS     -> ESCALATE / REFUND_EXCEPTION
PAYMENT_BILLING     -> ESCALATE / PAYMENT_DISPUTE
PRIME_VIDEO         -> AUTO_HANDLE
PRODUCT_DEVICE      -> AUTO_HANDLE
```

------------------------------------------------------------------------

## 17. Decision log

1.  **Selected Amazon as the target brand** because the assignment
    requires choosing one brand and the dataset contains substantial
    Amazon support conversations.
2.  **Created an Amazon-specific intent taxonomy** instead of using a
    generic intent list.
3.  **Used local MiniLM embeddings** for retrieval and intent
    classification to avoid unnecessary LLM/API calls.
4.  **Separated retrieval from generation** so the LLM receives
    historical evidence rather than operating without grounding.
5.  **Added reranking** so the final evidence is not determined solely
    by initial vector similarity.
6.  **Used three evidence items** for generation to provide multiple
    relevant historical examples without unnecessarily increasing prompt
    size.
7.  **Separated policy from the LLM** so escalation decisions are
    deterministic.
8.  **Escalated order-level, payment, account, refund, and cancellation
    cases** because the prototype has no authenticated access to those
    systems.
9.  **Added `OTHER_SUPPORT`** for messages that do not clearly fit the
    defined taxonomy.
10. **Added `UNSUPPORTED_REQUEST`** as a policy fallback for requests
    outside supported capabilities.
11. **Explicitly prohibited fabricated actions** such as refunds,
    cancellations, replacements, investigations, and carrier contact.
12. **Added response validation** as a second safety layer after
    generation.
13. **Used a representative evaluation strategy** to control LLM API
    consumption while still covering multiple intents.
14. **Reported the 90% result with its limitations** rather than
    presenting it as a production accuracy metric.
15. **Kept UI/API outside the prototype scope** because the assignment
    focuses on the AI pipeline and its proof.

------------------------------------------------------------------------

## 18. What I would do with one more week

1.  Run the complete 180-example golden set with an LLM judge after
    obtaining sufficient API capacity.
2.  Compare the semantic classifier quantitatively against the trivial
    and lexical baselines.
3.  Add a calibrated confidence threshold and route low-confidence
    intent predictions to `OTHER_SUPPORT` or human review.
4.  Improve retrieval for noisy, sarcastic, and multi-issue messages
    using hybrid lexical + semantic retrieval.
5.  Build a human-rated subset to measure agreement between the
    automated judge and human reviewers.
6.  Add structured evaluation metrics for groundedness, action safety,
    empathy, relevance, and resolution usefulness.
7.  Add regression tests for every previously observed failure mode.

------------------------------------------------------------------------

## 19. Project structure

``` text
AI-Support-Agent/
│
├── data/
│   ├── raw/
│   └── processed/
│
├── scripts/
│   ├── analyzeAmazon.ts
│   ├── analyzeBrandConversations.ts
│   ├── analyzeDataset.ts
│   ├── applyGoldenActions.ts
│   ├── applyGoldenCorrections.ts
│   ├── buildAmazonKnowledge.ts
│   ├── buildAmazonVectorIndex.ts
│   ├── cleanBrandConversations.ts
│   ├── createGoldenCandidates.ts
│   ├── evaluateAgent.ts
│   ├── evaluateRetrieval.ts
│   ├── extractAmazonConversations.ts
│   ├── inspectAmazonSample.ts
│   ├── inspectGoldenCandidates.ts
│   ├── labelGoldenCandidates.ts
│   ├── prepareGoldenVerification.ts
│   ├── sampleAmazonConversations.ts
│   ├── testAgent.ts
│   ├── testEmbedding.ts
│   ├── testPolicy.ts
│   ├── testReranker.ts
│   ├── testRetriever.ts
│   ├── testValidator.ts
│   └── testVectorRetriever.ts
│
├── src/
│   ├── agent/
│   │   ├── agent.ts
│   │   ├── classifier.ts
│   │   ├── index.ts
│   │   ├── llm.ts
│   │   ├── policy.ts
│   │   └── validator.ts
│   │
│   ├── config/
│   │   └── amazon/
│   │       ├── actionPolicy.ts
│   │       ├── escalationRules.ts
│   │       └── intents.ts
│   │
│   └── rag/
│       ├── chunker.ts
│       ├── documents.ts
│       ├── embedding.ts
│       ├── index.ts
│       ├── reranker.ts
│       ├── retriever.ts
│       ├── vectorRetriever.ts
│       └── vectorStore.ts
│
└── tests/
    └── evaluation/
        └── amazon/
            ├── golden-set.json
            └── agent-evaluation.json
```

------------------------------------------------------------------------

## 20. Assignment alignment

The Hiver assignment asks for:

  -----------------------------------------------------------------------
  Requirement                         Status
  ----------------------------------- -----------------------------------
  Choose one brand                    Complete --- Amazon

  Intent classification               Complete

  Historically grounded replies       Complete

  Auto-handle vs human escalation     Complete

  Runnable pipeline                   Complete

  150--250 golden examples            Complete --- 180

  Evaluation harness                  Complete

  LLM-as-judge + human agreement      **Not fully completed / not
  evidence                            claimed**

  Results vs trivial baseline         **Baseline definition included;
                                      verified numeric result not
                                      claimed**

  Results vs simple baseline          **Baseline definition included;
                                      verified numeric result not
                                      claimed**

  Top 5 failure modes                 Complete

  Misleading headline number          Complete

  One-week plan                       Complete

  10--15 decision log                 Complete --- 15 decisions

  UI/API                              Not required for the core
                                      assignment
  -----------------------------------------------------------------------

The implementation intentionally avoids claiming evidence that was not
actually measured.

------------------------------------------------------------------------

## 21. References

-   Hiver SDE Intern Take-Home Assignment --- provided assignment PDF.
-   Customer Support on Twitter dataset --- the primary dataset
    specified by the assignment.
-   `Xenova/all-MiniLM-L6-v2` --- local embedding model used by the
    project.
-   Groq API --- current LLM generation provider.

All borrowed concepts, models, and external resources should be cited in
the final repository/submission according to the assignment's citation
requirement.

------------------------------------------------------------------------

## 22. Final summary

This project implements an end-to-end Amazon AI support pipeline:

``` text
messy customer-support data
        ↓
Amazon-specific knowledge base
        ↓
semantic retrieval
        ↓
reranking
        ↓
semantic intent classification
        ↓
deterministic escalation policy
        ↓
grounded Groq response generation
        ↓
response safety validation
        ↓
customer-facing answer
```

The latest verified representative evaluation completed **9 of 10 cases
successfully**, with an average top retrieval similarity of **0.7798**.

The most important design principle is that the system does not allow
the LLM to pretend that it performed actions that the application cannot
actually perform. This makes the prototype safer and more suitable for
customer-support automation.
