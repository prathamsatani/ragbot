import { connectToDB, findFromDB } from "@/actions/db-ops";
export async function GET() {
  try {
    const { client, collection } = await connectToDB({
      dbName: "ragbot",
      collectionName: "admin",
    });

    const users = await findFromDB({ collection, filter: {}, options: {projection:{_id:0, password:0}} });
    await client.close();

    return new Response(JSON.stringify({users}), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error fetching users:", e);
    return new Response(
      JSON.stringify({
        status: "error",
        message: "Failed to fetch users",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
