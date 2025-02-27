import { connectToDB, findFromDB } from "@/actions/db-ops";

export async function GET() {
    try {
      const { client, collection } = await connectToDB({
        dbName: "ragbot",
        collectionName: "api-logs",
      });
  
      const logs = await findFromDB({ collection, filter: {}, options: {projection:{_id:0, ip:0}} });
      await client.close();
  
      return new Response(JSON.stringify({logs}), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {
      console.error("Error fetching users:", e);
      return new Response(
        JSON.stringify({
          status: "error",
          message: "Failed to fetch logs",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }