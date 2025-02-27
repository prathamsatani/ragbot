import { FormEvent, SetStateAction } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface MyTextareaProps {
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  setInput: (value: SetStateAction<string>) => void;
  isLoading: boolean;
  input: string;
}

export default function MyTextarea({
  handleSubmit,
  setInput,
  isLoading,
  input,
}: MyTextareaProps) {
  return (
    <div className="bg-background-main w-full flex justify-center pb-4">
      <div className="bg-background-textarea w-3/5 p-4 rounded-3xl">
        <form
          onSubmit={handleSubmit}
          className="flex-col md:flex-row w-full mx-auto space-y-3 md:space-y-0 md:space-x-3"
        >
          <div className="flex-col">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message RAGBot..."
              className="border-none shadow-none w-full text-white outline-none placeholder-shown:text-lg text-lg"
            />
            <div className="pb-4"></div>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-background-main text-white rounded-lg text-lg shadow-md px-4 py-2 w-full"
            >
              Send
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
