import { connectToDB, findFromDB } from "@/actions/db-ops";

export async function GET(req: Request) {
  try {
    const { client, collection } = await connectToDB({ dbName: "ragbot", collectionName: "bot-settings" });

    const results = await findFromDB({ collection, filter: {isActive:true}, options: {} });
    client.close();
    console.log(results);
    console.log(typeof results);
    return new Response(JSON.stringify(results), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ status: "500" }), {
      headers: { "Content-Type": "application/json" },
    });
  }
}