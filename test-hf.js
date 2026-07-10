const token = process.env.HF_API_TOKEN;

async function test() {
  const response = await fetch(
    "https://router.huggingface.co/hf-inference/models/BAAI/bge-base-en-v1.5/pipeline/feature-extraction",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: "This is a test sentence.",
      }),
    }
  );

  console.log("Status:", response.status);

  const data = await response.json();

  if (Array.isArray(data)) {
    console.log("Array length:", data.length);

    if (Array.isArray(data[0])) {
      console.log("Embedding dimensions:", data[0].length);
    } else {
      console.log("Embedding dimensions:", data.length);
    }
  } else {
    console.log(data);
  }
}

test().catch(console.error);