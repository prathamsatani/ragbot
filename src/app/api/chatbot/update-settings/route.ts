import { connectToDB, insertIntoDB, updateDB } from "@/actions/db-ops";
import { ObjectId } from "mongodb";
import { ChatbotSettingsModel } from "@/models/model";

export async function POST(request: Request): Promise<Response> {
  const settings = await request.formData();
  const {client, collection} = await connectToDB({dbName: "ragbot", collectionName: "bot-settings"});

  const jsonObject: Record<string, any> = {};

  settings.forEach((value, key) => {
    if (value instanceof File) {
      jsonObject[key] = {
        name: value.name,
        size: value.size,
        type: value.type,
        lastModified: value.lastModified
      };
    } else {
      if (key != "_id") {
        jsonObject[key] = value;
      } else {
        jsonObject[key] = new ObjectId(value);
      }
    }
  });

  await insertIntoDB({collection, document: jsonObject});

  return new Response("OK", { status: 200 });
}

export async function PUT(request: Request): Promise<Response> {
  const settings = await request.formData();
  const {client, collection} = await connectToDB({dbName: "ragbot", collectionName: "bot-settings"});

  const jsonObject: any = {};

  settings.forEach((value, key) => {
    if (value instanceof File) {
      jsonObject[key] = {
        name: value.name,
        size: value.size,
        type: value.type,
        lastModified: value.lastModified
      };
    } else {
      if (key != "_id") {
        jsonObject[key] = value;
      } else {
        jsonObject[key] = new ObjectId(value);
      }
    }
  });

  const chatbotSettings = new ChatbotSettingsModel()
  chatbotSettings.serialize(jsonObject)

  await updateDB({collection, document: {$set: chatbotSettings.getChatbotSettings()}, filter: { _id: jsonObject._id }, options: { upsert: true }});

  client.close()
  return new Response("OK", { status: 200 });
}