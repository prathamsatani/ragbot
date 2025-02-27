import { connectToDB, findFromDB} from "@/actions/db-ops";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    
    const {client, collection} = await connectToDB({dbName: "ragbot", collectionName: "admin"});
  
    const results = (await findFromDB({collection, filter: { email, password }, options: {}})).length;
    client.close();

    if (results === 0) {
      return new Response(JSON.stringify({ status: "401" }), {
        headers: { "Content-Type": "application/json" },
      });
    } else {
      return new Response(JSON.stringify({ status: "200" }), {
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (e) {
    return new Response(JSON.stringify({ status: "500" }), {
      headers: { "Content-Type": "application/json" },
    });
  }
}
