import { EventLogModel } from "@/models/model";
import { connectToDB, insertIntoDB } from "@/actions/db-ops";
import { UUID } from "mongodb";

export async function POST(req: Request) {
  const { timestamp, severity, textPayload, source } = await req.json();
  
  const { client, collection } = await connectToDB({
    dbName: "ragbot",
    collectionName: "event-logs",
  });

  await insertIntoDB({ 
    collection, 
    document: new EventLogModel(new UUID(), timestamp, severity, textPayload, source).getLog()
  });
  
  await client.close();
  return new Response(JSON.stringify({ status: "200" }), {
    headers: { "Content-Type": "application/json" },
  });
}
