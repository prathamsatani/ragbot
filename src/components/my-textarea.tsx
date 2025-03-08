import { FormEvent, SetStateAction, useEffect, useRef } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { IconSend } from "@tabler/icons-react";

interface TextareaProps {
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  setInput: (value: SetStateAction<string>) => void;
  isLoading: boolean;
  input: string;
}

export default function EnhancedTextarea({
  handleSubmit,
  setInput,
  isLoading,
  input,
}: TextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Automatically resize textarea as content grows
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [input]);

  // Handle Enter key (with Shift+Enter for new lines)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !isLoading && input.trim()) {
      e.preventDefault();
      const form = e.currentTarget.closest("form");
      if (form) form.requestSubmit();
    }
  };

  return (
    <div className="bg-neutral-900 w-full flex justify-center pb-4 px-4">
      <div className="bg-neutral-800 w-full md:w-3/5 rounded-xl shadow-md transition-all border border-neutral-700 hover:border-neutral-600 focus-within:border-neutral-500">
        <form onSubmit={handleSubmit} className="flex flex-col w-full">
          <div className="flex items-end p-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message RAGBot..."
              className="flex-1 border-none bg-transparent shadow-none w-full text-white outline-none placeholder:text-lg text-lg resize-none py-2 px-3 min-h-[40px] max-h-40"
              rows={1}
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className={`p-2 rounded-lg ml-2 mb-1 ${
                      !input.trim() || isLoading 
                        ? "text-neutral-500 cursor-not-allowed" 
                        : "text-white hover:bg-neutral-700 active:bg-neutral-600"
                    }`}
                  >
                    <IconSend size={22} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Send message (Enter)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="px-4 pb-2 text-xs text-neutral-500">
            Press Enter to send, Shift+Enter for new line
          </div>
        </form>
      </div>
    </div>
  );
}
