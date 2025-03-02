import { MongoClient } from "mongodb";
import type { Abortable, Collection, DeleteOptions, Document, Filter, FindOptions, InsertOneOptions, UpdateOptions } from "mongodb";

interface connectToDBProps {
  dbName: string;
  collectionName: string;
}

interface findFromDBProps {
  collection: Collection<Document>;
  filter: Filter<Document>;
  options: FindOptions & Abortable;
}

interface insertIntoDBProps {
  collection: Collection<Document>;
  document: Document;
  options?: InsertOneOptions;
}

interface deleteFromDBProps {
  collection: Collection<Document>;
  filter: Filter<Document>;
  options?: DeleteOptions;
}

interface updateDBProps {
  collection: Collection<Document>;
  document: Document;
  filter: Filter<Document>;
  options?: UpdateOptions;
}

export async function connectToDB({
  dbName,
  collectionName,
}: connectToDBProps) {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("MONGO_URI is not defined");
  }

  const client = new MongoClient(mongoUri);
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection(collectionName);

  return { client, collection };
}

export async function findFromDB({ collection, filter, options }: findFromDBProps) {
  return await collection.find(filter, options).toArray();
}
export async function insertIntoDB({
  collection,
  document,
  options
}: insertIntoDBProps) {
  await collection.insertOne(document, options);
}

export async function deleteFromDB({
  collection,
  filter,
}: deleteFromDBProps) {
  await collection.deleteOne(filter);
}

export async function updateDB({
  collection,
  document,
  filter,
  options
}: updateDBProps) {
  await collection.updateOne(filter, document, options);
}