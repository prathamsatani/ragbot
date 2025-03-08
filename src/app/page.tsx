"use client";
import { useState, useRef, useEffect } from "react";
import { Avatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import MyTextarea from "@/components/my-textarea";
import { cn } from "@/lib/utils";
import { Sidebar, SidebarBody } from "@/components/ui/sidebar";
import {
  IconLayoutSidebar,
  IconEdit,
  IconRobotFace,
} from "@tabler/icons-react";
import Link from "next/link";
import logEvent from "@/middleware/logging/log";
import { remark } from "remark";
import remarkHtml from "remark-html";
import remarkGfm from "remark-gfm";


type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

function MarkdownRenderer({ content }: { content: string }) {
  const [htmlContent, setHtmlContent] = useState("");

  useEffect(() => {
    async function processMarkdown() {
      // Add remarkGfm to the plugin chain
      const processed = await remark()
        .use(remarkGfm)
        .use(remarkHtml)
        .process(content);
      setHtmlContent(processed.toString());
    }
    processMarkdown();
  }, [content]);

  // Add a wrapper with classes for debugging
  return (
    <div
      className="prose prose-invert max-w-none [&>ol]:list-decimal [&>ul]:list-disc [&>ol]:ml-4 [&>ul]:ml-4 [&_li]:my-1 [&_ul]:my-2 [&_ol]:my-2 [&_li>ul]:mt-2 [&_li>ol]:mt-2 markdown-content"
      style={
        {
          "--tw-prose-invert-bullets": "white",
          "--tw-prose-invert-counters": "white",
          width: "100%", // Ensure full width
        } as React.CSSProperties
      }
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}

export default function Page() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
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
      };
      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessageContent = (message: Message) => {
    if (message.role === "user") {
      // For user messages, simply render plain text
      return <div className="whitespace-pre-wrap">{message.content}</div>;
    }

    // For assistant messages, check if the content appears to be markdown
    const containsMarkdown =
      /(\*\*|__|##|```|\[.*\]\(.*\)|!\[.*\]\(.*\)|-\s|[0-9]+\.\s|\|[\s\S]*\|)/.test(
        message.content
      );

    // If it contains markdown patterns or is a large text block, use MarkdownRenderer
    if (containsMarkdown || message.content.length > 100) {
      return <MarkdownRenderer content={message.content} />;
    } else {
      // For simple text responses, render as plain text
      return <div className="whitespace-pre-wrap">{message.content}</div>;
    }
  };
  const today = [
    { title: "Today 1" },
    { title: "Today 2" },
    { title: "Today 3" },
    { title: "Today 4" },
    { title: "Today 5" },
  ];

  const yesterday = [
    { title: "Yesterday 1" },
    { title: "Yesterday 2" },
    { title: "Yesterday 3" },
    { title: "Yesterday 4" },
    { title: "Yesterday 5" },
  ];

  const lastWeek = [
    { title: "Last Week 1" },
    { title: "Last Week 2" },
    { title: "Last Week 3" },
    { title: "Last Week 4" },
    { title: "Last Week 5" },
  ];

  return (
    <div
      className={cn(
        "rounded-md flex flex-col md:flex-row w-full flex-1 mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden",
        "h-screen"
      )}
    >
      <Sidebar open={open} setOpen={setOpen} animate={true}>
        <SidebarBody className="gap-4 bg-background-sidebar">
          <div className="flex">
            <button
              hidden={!open}
              onClick={() => setOpen(!open)}
              className="hover:bg-background-hover p-2 rounded-lg"
            >
              <IconLayoutSidebar className="text-font-main w-7 h-7" />
            </button>
            <div className="w-full" />
            <Link
              hidden={!open}
              href="/"
              className="hover:bg-background-hover p-2 rounded-lg"
            >
              <IconEdit className="text-font-main w-7 h-7" />
            </Link>
          </div>
          <ScrollArea className="h-full">
            <div className="pb-4">
              <div className="text-font-main text-sm p-2">Today</div>
              <div className="flex flex-col">
                {today.map((item) => (
                  <Link
                    href=""
                    key={item.title}
                    className="text-font-main p-2 text-sm hover:bg-background-hover rounded-lg"
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
            <div className="pb-4">
              <div className="text-font-main text-sm p-2">Yesterday</div>
              <div className="flex flex-col">
                {yesterday.map((item) => (
                  <Link
                    href=""
                    key={item.title}
                    className="text-font-main p-2 text-sm hover:bg-background-hover rounded-lg"
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
            <div className="pb-4">
              <div className="text-font-main text-sm p-2">Last Week</div>
              <div className="flex flex-col">
                {lastWeek.map((item) => (
                  <Link
                    href=""
                    key={item.title}
                    className="text-font-main p-2 text-sm hover:bg-background-hover rounded-lg"
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
          </ScrollArea>
        </SidebarBody>
        <div className="flex flex-col items-stretch min-h-screen w-screen p-4 bg-background-main">
          <div className="flex">
            <button
              hidden={open}
              onClick={() => setOpen(!open)}
              className="hover:bg-background-hover p-2 rounded-lg"
            >
              <IconLayoutSidebar className="text-font-main w-7 h-7" />
            </button>
            <Link
              hidden={open}
              href="/"
              className="hover:bg-background-hover p-2 rounded-lg"
            >
              <IconEdit className="text-font-main w-7 h-7" />
            </Link>
            <div className="w-4" />
            <h1 className="text-xl text-font-main md:text-2xl font-semibold py-2">
              RAGBot
            </h1>
          </div>
          <div className="flex flex-col items-center justify-center h-[calc(100vh-5rem)]">
            <ScrollArea className="w-full md:w-full lg:w-full h-full p-4 flex-grow">
              <div className="flex items-center justify-center h-full">
                <div className="flex flex-col w-3/5" ref={scrollAreaRef}>
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`mb-4 ${
                        m.role === "user"
                          ? "flex justify-end"
                          : "flex justify-start"
                      }`}
                    >
                      {m.role === "user" ? (
                        <div className="flex items-start gap-2 flex-row-reverse max-w-full md:max-w-[70%]">
                          <div className="bg-background-textarea text-font-main rounded-full rounded-br-none p-4 shadow-md">
                            {renderMessageContent(m)}
                          </div>
                        </div>
                      ) : (
                        <div className="w-full flex items-start gap-2 py-5">
                          <Avatar>
                            <IconRobotFace className="w-8 h-8 text-font-main" />
                          </Avatar>
                          <div className="bg-background-main text-font-main px-3 w-full overflow-x-auto">
                            {renderMessageContent(m)}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="w-full flex items-start gap-2 py-5">
                      <Avatar>
                        <IconRobotFace className="w-8 h-8 text-font-main" />
                      </Avatar>
                      <div className="bg-background-main text-font-main">
                        AI is thinking...
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
            <div className="w-full md:w-full lg:w-full">
              <MyTextarea
                setInput={setInput}
                input={input}
                handleSubmit={handleSubmit}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      </Sidebar>
    </div>
  );
}
