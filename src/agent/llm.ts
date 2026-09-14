import "dotenv/config";
import Groq from "groq-sdk";

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  throw new Error("GROQ_API_KEY is not set in .env");
}

const client = new Groq({
  apiKey,
});

export interface LLMResponse {
  response: string;
}

export async function generateSupportResponse(
  systemPrompt: string,
  userPrompt: string
): Promise<LLMResponse> {
  const completion = await client.chat.completions.create({
    model: "openai/gpt-oss-120b",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
  });

  const response = completion.choices[0]?.message?.content?.trim();

  if (!response) {
    throw new Error("LLM returned an empty response");
  }

  return {
    response,
  };
}