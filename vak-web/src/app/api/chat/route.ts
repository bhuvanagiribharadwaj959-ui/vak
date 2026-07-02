import { NextResponse } from "next/server";

const HF_API_URL =
  "https://blaze1234567-vak-api.hf.space/generate";

async function queryHF(
  prompt: string,
  token: string,
  retries = 3
): Promise<string> {
  for (let attempt = 0; attempt < retries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    try {
      const response = await fetch(HF_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 150,
            temperature: 0.85,
            top_p: 0.92,
            top_k: 50,
            repetition_penalty: 1.3,
            return_full_text: false,
            do_sample: true,
          },
          options: {
            wait_for_model: true,
            use_cache: false,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (response.status === 503) {
        const body = await response.json().catch(() => ({}));
        const waitTime = (body.estimated_time || 20) * 1000;
        console.log(
          `Model loading, retrying in ${waitTime / 1000}s (attempt ${attempt + 1}/${retries})…`
        );
        await new Promise((r) => setTimeout(r, Math.min(waitTime, 30000)));
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HF API Error (${response.status}):`, errorText);
        if (attempt < retries - 1) {
          await new Promise((r) => setTimeout(r, 2000));
          continue;
        }
        throw new Error(`HF API returned ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      let text = "";
      if (Array.isArray(data) && data.length > 0 && data[0].generated_text) {
        text = data[0].generated_text;
      } else if (data.generated_text) {
        text = data.generated_text;
      }

      return text.trim();
    } catch (err) {
      clearTimeout(timeout);
      if (err instanceof Error && err.name === "AbortError") {
        console.error("Request timed out");
      }
      if (attempt < retries - 1) {
        console.log(`Fetch failed, retrying (attempt ${attempt + 1})…`);
        await new Promise((r) => setTimeout(r, 2000));
        continue;
      }
      throw err;
    }
  }

  throw new Error("All retries exhausted");
}

export async function POST(request: Request) {
  try {
    const { message, history } = await request.json();

    const hfToken = process.env.HF_TOKEN;
    if (!hfToken) {
      return NextResponse.json(
        { error: "HF_TOKEN is not configured" },
        { status: 500 }
      );
    }

    // Build a mythology-oriented prompt
    let prompt =
      "The following is a conversation with an AI assistant deeply knowledgeable about Indian mythology, " +
      "the Ramayana, the Mahabharata, and world folklore.\n\n";

    if (history && history.length > 0) {
      const recent = history.slice(-4);
      for (const msg of recent) {
        if (msg.role === "user") {
          prompt += `Human: ${msg.content}\n`;
        } else {
          prompt += `AI: ${msg.content}\n`;
        }
      }
    }

    prompt += `Human: ${message}\nAI:`;

    const reply = await queryHF(prompt, hfToken);

    // Clean up
    let cleaned = reply;
    const stopIdx = cleaned.indexOf("Human:");
    if (stopIdx !== -1) {
      cleaned = cleaned.substring(0, stopIdx).trim();
    }
    const aiIdx = cleaned.indexOf("\nAI:");
    if (aiIdx !== -1) {
      cleaned = cleaned.substring(0, aiIdx).trim();
    }

    if (!cleaned) {
      cleaned =
        "I could not generate a response. Please try a different prompt.";
    }

    return NextResponse.json({ reply: cleaned });
  } catch (error) {
    console.error("Chat API Error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Also expose a GET endpoint to provide the token to the client for direct calls
export async function GET() {
  const token = process.env.HF_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "No token" }, { status: 500 });
  }
  return NextResponse.json({ token });
}
