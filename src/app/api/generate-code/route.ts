import OpenAI from "openai";

// Create an OpenAI API client with DeepSeek's configuration
const openai = new OpenAI({
  baseURL: "https://api.deepseek.com/v1",
  apiKey: process.env.DEEPSEEK_API_KEY,
  defaultHeaders: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
  },
});

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { prompt, htmlDocument } = await req.json();

    const stream = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: `You are an expert JavaScript developer who writes clean, 
                    efficient code. You are given a prompt and you need to generate a 
                    code snippet that solves the problem. You need to write the code in a way 
                    that is easy to understand and easy to maintain. You need to write code
                    for this html document: ${htmlDocument}. Provide the code between these tags <js></js>.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      stream: true,
      temperature: 0.7,
      max_tokens: 2000,
    });

    return new Response(stream.toReadableStream());
  } catch (error: any) {
    console.error("API Error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to generate code",
      }),
      { status: 500 }
    );
  }
}
