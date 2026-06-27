

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatCompletionOptions {
  messages: ChatMessage[];
  temperature?: number;
  jsonMode?: boolean;
}

export async function getChatCompletion(
  options: ChatCompletionOptions
): Promise<string> {
  const provider = process.env.AI_PROVIDER ?? "ollama";

  if (provider === "groq") {
    return getGroqCompletion(options);
  }

  return getOllamaCompletion(options);
}

async function getOllamaCompletion(
  options: ChatCompletionOptions
): Promise<string> {
  const baseUrl = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
  const model = process.env.OLLAMA_CHAT_MODEL ?? "llama3.1:8b";

  const response = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: options.messages,
      stream: false,
      options: {
        temperature: options.temperature ?? 0.3,
      },
      format: options.jsonMode ? "json" : undefined,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Ollama request failed: ${response.status} ${await response.text()}`
    );
  }

  const data = await response.json();

  return data.message?.content ?? "";
}

async function getGroqCompletion(
  options: ChatCompletionOptions
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  const model =
    process.env.GROQ_CHAT_MODEL ?? "llama-3.1-8b-instant";

  if (!apiKey) {
    throw new Error(
      "GROQ_API_KEY is not set, but AI_PROVIDER is 'groq'."
    );
  }

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: options.messages,
        temperature: options.temperature ?? 0.3,
        response_format: options.jsonMode
          ? { type: "json_object" }
          : undefined,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Groq request failed: ${response.status} ${await response.text()}`
    );
  }

  const data = await response.json();

  return data.choices?.[0]?.message?.content ?? "";
}


export async function getEmbedding(
  text: string
): Promise<number[]> {
  const baseUrl = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
  const model =
    process.env.OLLAMA_EMBED_MODEL ?? "nomic-embed-text";

  const response = await fetch(`${baseUrl}/api/embeddings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      prompt: text,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Ollama embedding request failed: ${response.status}`
    );
  }

  const data = await response.json();

  return data.embedding;
}