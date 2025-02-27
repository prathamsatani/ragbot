import { Chroma } from "@langchain/community/vectorstores/chroma";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { MessagesPlaceholder } from "@langchain/core/prompts";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import dotenv from "dotenv";
dotenv.config();

interface MessageHistory {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatBotConfig {
  apiKey?: string;
  embeddingModel?: string;
  chatModel?: string;
  chromaUrl?: string;
  collectionName?: string;
}

const SYSTEM_PROMPT = `
  You are an Electronics Recommendation Bot designed to assist users in finding the best electronics tailored to their needs. 
  Begin by providing 8 recommendations from the category specified by the user (e.g., TV, Monitor). Ensure that recommendations:
  - Are unique and do not include duplicate entries.
  - Include options from a variety of top brands.
  - Present detailed key features available in the dataset.

  Dynamically refine and update these recommendations based on additional user inputs such as budget, features, brand preferences, or specific use cases. 

  Structure your response in HTML using the following format:

  <h1>, <h2>: For section headings.
  <p>: For introductory text or additional explanations.
  <ul>, <li>: For unordered lists of product recommendations or feature highlights.
  <ol>, <li>: For ordered lists when prioritizing items or steps.
  <strong>: To highlight product names and key features.
  <b>: For emphasis within the text.
  <br>: For spacing between sections or paragraphs.

  Note: Do NOT use any other format except HTML to structure your response. Strictly use HTML tags for formatting.

  For each recommendation, include:
  - The product name (<strong>)
  - A concise description of its detailed features from the dataset
  - Why it is suitable for the user's specified or inferred needs
  - Its price

  When the user requests a comparison, provide a detailed comparison in a **tabular format** with white borders. Include rows for:
  - Product name
  - Price
  - Key features
  - Suitability for specific use cases
  - Brand
  - Warranty or additional benefits

  If no additional details are provided initially:
  - Suggest popular or highly rated products across different price ranges and brands in the specified category.
  - Ask polite and specific questions to refine the recommendations, such as:
    - Budget range
    - Preferred screen size or resolution
    - Desired smart features or operating systems
    - Primary use case (e.g., gaming, streaming, professional work)

  Ensure the recommendations:
  - Are drawn directly from the dataset.
  - Avoid repetition and provide a diverse range of products.

  If required information is unavailable:
  - Inform the user politely and suggest ways to refine their query.
  - Provide actionable advice for narrowing down preferences.

  Do not speculate or provide recommendations outside the retrieved dataset. Maintain a user-focused approach and ensure responses are clear, relevant, and concise.
  {context}
`;

const RETRIEVER_PROMPT = `
    Your task is to summarize the chat history in a way that retains the context needed for a multi-turn conversation. 
    Extract the key details from the user's questions, preferences, and responses to create a concise yet comprehensive summary. 
    Focus on capturing:
    - The user's primary query or requirement (e.g., type of electronic device, specific use case).
    - Any additional parameters provided (e.g., budget, features, brand preferences).
    - Clarifications or refinements made by the user during the conversation.
  
    Ensure the summary is standalone and provides sufficient context to understand the user's needs without referring to the full chat history. 
    Avoid including unnecessary details or duplicating information. 
    If the user hasn't provided sufficient detail, note this in the summary and suggest asking targeted follow-up questions.
`;

class ChatBot {
  private initialized: boolean;
  private embeddingFunction?: GoogleGenerativeAIEmbeddings;
  private vectorstore?: Chroma;
  private gemini?: ChatGoogleGenerativeAI;
  private contextualizeQPrompt?: ChatPromptTemplate;
  private qaPrompt?: ChatPromptTemplate;
  private retrievalChain?: any;

  constructor(private config: ChatBotConfig = {}) {
    this.initialized = false;
  }

  async initialize(): Promise<void> {
    try {
      this.embeddingFunction = new GoogleGenerativeAIEmbeddings({
        apiKey: this.config.apiKey || process.env.GEMINI_API_KEY,
        model: this.config.embeddingModel || "models/text-embedding-004",
      });

      this.vectorstore = new Chroma(this.embeddingFunction, {
        url: this.config.chromaUrl || process.env.CHROMA_URL || "http://localhost:8000",
        collectionName: this.config.collectionName || process.env.COLLECTION_NAME || "my_collection",
      });

      this.gemini = new ChatGoogleGenerativeAI({
        apiKey: this.config.apiKey || process.env.GEMINI_API_KEY,
        model: this.config.chatModel || "gemini-1.5-flash",
        temperature: 0.7,
      });

      this.contextualizeQPrompt = ChatPromptTemplate.fromMessages([
        { role: "system", content: RETRIEVER_PROMPT },
        new MessagesPlaceholder({ variableName: "chat_history" }),
        { role: "human", content: "{input}" },
      ]);

      this.qaPrompt = ChatPromptTemplate.fromMessages([
        { role: "system", content: SYSTEM_PROMPT },
        new MessagesPlaceholder({ variableName: "chat_history" }),
        { role: "human", content: "{input}" },
      ]);

      const historyAwareRetriever = await createHistoryAwareRetriever({
        llm: this.gemini,
        retriever: this.vectorstore.asRetriever(50),
        rephrasePrompt: this.contextualizeQPrompt,
      });

      const questionAnswerChain = await createStuffDocumentsChain({
        llm: this.gemini,
        prompt: this.qaPrompt,
      });

      this.retrievalChain = await createRetrievalChain({
        retriever: historyAwareRetriever,
        combineDocsChain: questionAnswerChain,
      });

      this.initialized = true;
    } catch (error) {
      console.error("Failed to initialize chatbot:", error);
      throw error;
    }
  }

  private cleanHtmlResponse(text: string): string {
    return text
      .replace(/^`{1,6}html?\n?/, "")
      .replace(/`{1,6}$/, "")
      .replace(/\n/g, "")
      .replace(/\n{3,}/g, "")
      .trim();
  }

  private removeHTMLTags(text: string): string {
    return text.replace(/<.*?>/g, "");
  }

  private processChatHistory(history: MessageHistory[]): (HumanMessage | AIMessage)[] {
    if (!Array.isArray(history)) {
      console.warn("History is not an array:", history);
      return [];
    }

    return history.map(message => {
      if (message.role === "user") {
        return new HumanMessage(this.removeHTMLTags(message.content));
      } else {
        return new AIMessage(message.content);
      }
    });
  }

  async processMessage(question: string, history: MessageHistory[] = []): Promise<string> {
    if (!this.initialized) {
      throw new Error("Chatbot not initialized");
    }

    try {
      const chatHistory = this.processChatHistory(history);

      const response = await this.retrievalChain.invoke({
        input: question,
        chat_history: chatHistory,
      });

      const cleanedResponse = this.cleanHtmlResponse(response.answer);
      return cleanedResponse;
    } catch (error) {
      console.error("Error processing message:", error);
      throw error;
    }
  }
}

export default ChatBot;