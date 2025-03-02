import { connectToDB, findFromDB } from "@/actions/db-ops";

export async function GET(req: Request) {
  try {
    const { client, collection } = await connectToDB({ dbName: "ragbot", collectionName: "bot-settings" });

    const results = await findFromDB({ collection, filter: {}, options: {} });
    client.close();

    return new Response(JSON.stringify(results), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ status: "500" }), {
      headers: { "Content-Type": "application/json" },
    });
  }
}