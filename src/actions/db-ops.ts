import { MongoClient } from "mongodb";
import type { Abortable, Collection, Document, Filter, FindOptions } from "mongodb";

interface connectToDBProps {
  dbName: string;
  collectionName: string;
}

interface findFromDBProps {
  collection: Collection<Document>;
  filter: Filter<Document>;
  options: FindOptions & Abortable;
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
}: {
  collection: Collection<Document>;
  document: Document;
}) {
  await collection.insertOne(document);
}

export async function deleteFromDB({
  collection,
  filter,
}: {
  collection: Collection<Document>;
  filter: Filter<Document>;
}) {
  await collection.deleteOne(filter);
}
