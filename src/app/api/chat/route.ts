import logEvent from "@/middleware/logging/log";
import ChatBot from "../../../utils/chatbot";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const chatbot = new ChatBot();
await chatbot.initialize();

function createChatHistory(messages: Message[]) {
  return messages.map(({ role, content }) => ({ role, content }));
}

export async function POST(req: Request) {
  const { messages } = await req.json();
  const query = messages.slice(-1)[0]["content"];
  const chat_history = createChatHistory(messages);
  const text = await chatbot.processMessage(query, chat_history);
    
  return new Response(JSON.stringify({ text }), {
    headers: { "Content-Type": "application/json" },
  });
}
