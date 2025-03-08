"use client";
import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  IconLayoutSidebar,
  IconEdit,
  IconRobotFace,
  IconMessageCircle,
  IconUserFilled,
  IconBrandGithubCopilot,
} from "@tabler/icons-react";
import Link from "next/link";
import logEvent from "@/middleware/logging/log";
import { remark } from "remark";
import remarkHtml from "remark-html";
import remarkGfm from "remark-gfm";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import EnhancedTextarea from "@/components/my-textarea";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
};

// Enhanced Markdown renderer with better styling and support for code blocks
function MarkdownRenderer({ content }: { content: string }) {
  const [htmlContent, setHtmlContent] = useState("");

  useEffect(() => {
    async function processMarkdown() {
      const processed = await remark()
        .use(remarkGfm)
        .use(remarkHtml)
        .process(content);
      setHtmlContent(processed.toString());
    }
    processMarkdown();
  }, [content]);

  return (
    <div
      className="prose prose-invert max-w-none 
                [&>ol]:list-decimal [&>ul]:list-disc 
                [&>ol]:ml-6 [&>ul]:ml-6 
                [&_li]:my-1 [&_ul]:my-2 [&_ol]:my-2 
                [&_li>ul]:mt-2 [&_li>ol]:mt-2
                [&>p]:my-3
                [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:my-4
                [&>h2]:text-xl [&>h2]:font-bold [&>h2]:my-3
                [&>h3]:text-lg [&>h3]:font-bold [&>h3]:my-2
                [&>pre]:bg-neutral-800 [&>pre]:p-4 [&>pre]:rounded-md [&>pre]:my-4
                [&>blockquote]:border-l-4 [&>blockquote]:border-neutral-500 [&>blockquote]:pl-4 [&>blockquote]:py-1 [&>blockquote]:my-4 [&>blockquote]:bg-neutral-800/30 [&>blockquote]:rounded-r-md
                [&>table]:border-collapse [&>table]:w-full [&>table_th]:border [&>table_th]:border-neutral-700 [&>table_th]:p-2 [&>table_td]:border [&>table_td]:border-neutral-700 [&>table_td]:p-2 [&>table]:my-4
                [&>code]:bg-neutral-800 [&>code]:px-1.5 [&>code]:py-0.5 [&>code]:rounded-md [&>code]:text-orange-300
                [&_a]:text-blue-400 [&_a:hover]:underline
                markdown-content"
      style={
        {
          "--tw-prose-invert-bullets": "white",
          "--tw-prose-invert-counters": "white",
          width: "100%",
        } as React.CSSProperties
      }
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}

function MessageComponent({ message, index }: { message: Message, index: number }) {
  const [showTimestamp, setShowTimestamp] = useState(false);
  const isUser = message.role === "user";
  const timestamp = message.timestamp || new Date();
  
  const formattedTime = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(timestamp);

  return (
    <div
      className={`mb-4 group ${isUser ? "flex justify-end" : "flex justify-start"}`}
      onMouseEnter={() => setShowTimestamp(true)}
      onMouseLeave={() => setShowTimestamp(false)}
    >
      {isUser ? (
        <div className="flex items-start gap-2 flex-row-reverse max-w-full md:max-w-[70%] relative">
          <Avatar className="mt-1">
            <AvatarFallback className="bg-blue-600 text-white">
              <IconUserFilled className="w-5 h-5" />
            </AvatarFallback>
          </Avatar>
          <div className="bg-blue-600 text-white rounded-xl rounded-tr-none p-4 shadow-md">
            <div className="whitespace-pre-wrap break-words">{message.content}</div>
          </div>
          {showTimestamp && (
            <div className="absolute -bottom-4 right-10 text-xs text-neutral-500">
              {formattedTime}
            </div>
          )}
        </div>
      ) : (
        <div className="w-full flex items-start gap-2 py-2 relative group">
          <Avatar className="mt-1">
            <AvatarFallback className="bg-neutral-700">
              <IconBrandGithubCopilot className="w-5 h-5 text-white" />
            </AvatarFallback>
          </Avatar>
          <div className="bg-neutral-800 text-white px-4 py-3 rounded-xl rounded-tl-none w-full overflow-x-auto">
            <MarkdownRenderer content={message.content} />
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-0 top-0 flex gap-1 mt-2">
            <button className="p-1 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded">
              <IconMessageCircle size={16} />
            </button>
          </div>
          {showTimestamp && (
            <div className="absolute -bottom-4 left-10 text-xs text-neutral-500">
              {formattedTime}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Main component
export default function Page() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(true);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const logAPICalls = async (
    method: string,
    endpoint: string,
    status: number,
    ip: string
  ) => {
    await fetch("/api/logging/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        method: method,
        endpoint: endpoint,
        status: status,
        timestamp: new Date(),
        ip: ip,
      }),
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }
      await logEvent({
        method: "POST",
        endpoint: "/api/chat",
        status: 200,
        timestamp: new Date(),
        ip: "",
      });

      const { text } = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: text,
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
    } catch (error) {
      console.error("Error:", error);
      // Add error message
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, I encountered an error while processing your request. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-neutral-900 text-white overflow-hidden">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-neutral-900">
        {/* Header */}
        <header className="h-14 border-b border-neutral-800 flex items-center px-4 justify-between">
          <div className="flex items-center">
            {!open && (
              <button
                onClick={() => setOpen(true)}
                className="mr-3 p-1.5 rounded-md hover:bg-neutral-800"
              >
                <IconLayoutSidebar size={18} />
              </button>
            )}
            <h1 className="text-lg font-semibold">RAG-based Document Analysis</h1>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/" className="p-1.5 rounded-md hover:bg-neutral-800">
                    <IconEdit size={18} />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit conversation</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </header>
        
        {/* Chat Messages Area */}
        <div className="flex-1 overflow-hidden relative">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <IconRobotFace size={48} className="text-neutral-600 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Welcome to RAGBot</h2>
              <p className="text-neutral-400 max-w-md mb-6">
                I can help you analyze documents, answer questions, and provide insights based on your data.
              </p>
            </div>
          ) : (
            <ScrollArea className="h-full px-4 py-6">
              <div className="w-full md:w-3/5 mx-auto" ref={scrollAreaRef}>
                {messages.map((message, i) => (
                  <MessageComponent key={message.id} message={message} index={i} />
                ))}
                <div ref={messagesEndRef} />
                
                {isLoading && (
                  <div className="flex items-start gap-2 py-2 animate-pulse">
                    <Avatar className="mt-1">
                      <AvatarFallback className="bg-neutral-700">
                        <IconRobotFace className="w-5 h-5 text-white" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-neutral-800 text-white px-4 py-3 rounded-xl rounded-tl-none">
                      <div className="flex gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-neutral-600"></div>
                        <div className="w-2 h-2 rounded-full bg-neutral-600"></div>
                        <div className="w-2 h-2 rounded-full bg-neutral-600"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </div>
        
        <EnhancedTextarea
          setInput={setInput}
          input={input}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
