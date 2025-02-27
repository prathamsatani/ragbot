import { Chroma } from "@langchain/community/vectorstores/chroma";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import type { Document } from "@langchain/core/documents";

class VectorStore {
  vectorStore: Chroma;
  embeddings: GoogleGenerativeAIEmbeddings;

  constructor() {
    this.embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: "your-api-key",
      modelName: "models/text-embedding-004",
    });

    this.vectorStore = new Chroma(this.embeddings, {
      collectionName: "my-collection",
      url: process.env.CHROMA_URL || "http://localhost:8000",
      collectionMetadata: {
        "hnsw:space": "cosine",
      }
    });
  }

  async addDocuments(documents: Document[], ids: string[]) {
    await this.vectorStore.addDocuments(documents, {
      ids: ids,
    });
  }

  async search(query: string, top_k: number){
    const results = await this.vectorStore.similaritySearch(query, top_k);
    return results;
  }

  async deleteDocuments(ids: string[]) {
    await this.vectorStore.delete({ids: ids});
  }
}

export default VectorStore;