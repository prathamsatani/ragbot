import { Chroma } from "@langchain/community/vectorstores/chroma";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import type { Document } from "@langchain/core/documents";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

interface VectorStoreOptions {
  collectionName: string;
  url: string;
}

class VectorStore {
  private chroma: Chroma;
  private genaiEmbeddings: GoogleGenerativeAIEmbeddings;
  private splitter: RecursiveCharacterTextSplitter;

  constructor({ collectionName, url }: VectorStoreOptions) {
    this.genaiEmbeddings = new GoogleGenerativeAIEmbeddings();
    this.splitter = new RecursiveCharacterTextSplitter();
    this.chroma = new Chroma(this.genaiEmbeddings, {
      collectionName,
      url,
    });
  }

  async ingestFile(fileType: string, filePath: string): Promise<void> {
    if (fileType === "csv") {
      const loader = new CSVLoader(filePath);
      const documents = await loader.load();
      const splittedDocuments = await this.splitter.splitDocuments(documents);
      this.chroma.addDocuments(splittedDocuments);
    } else if (fileType === "txt") {
      const loader = new TextLoader(filePath);
      const documents = await loader.load();
      const splittedDocuments = await this.splitter.splitDocuments(documents);
      this.chroma.addDocuments(splittedDocuments);
    } else if (fileType === "pdf") {
      const loader = new PDFLoader(filePath);
      const documents = await loader.load();
      const splittedDocuments = await this.splitter.splitDocuments(documents);
      this.chroma.addDocuments(splittedDocuments);
    }
  }
}

export default VectorStore;
