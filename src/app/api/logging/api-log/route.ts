import { APILogModel } from "@/models/model";
import { connectToDB, insertIntoDB } from "@/actions/db-ops";

export async function POST(req: Request) {
  const { method, endpoint, status, timestamp, ip } = await req.json();
  const { client, collection } = await connectToDB({
    dbName: "ragbot",
    collectionName: "api-logs",
  });

  await insertIntoDB({ 
    collection, 
    document: new APILogModel(method, endpoint, status, new Date(timestamp), ip).getLog()
  });

  await insertIntoDB({
    collection, 
    document: new APILogModel("POST", "/api/logging/log", 200, new Date(), "").getLog()
  })
  
  await client.close();
  return new Response(JSON.stringify({ status: "200" }), {
    headers: { "Content-Type": "application/json" },
  });
}
