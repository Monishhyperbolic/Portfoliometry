import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI); // Mongo URI from environment variables

export async function connectToDatabase() {
    if (!client.isConnected()) {
        await client.connect(); // Establish connection if not connected
    }

    const db = client.db("tradedaddy"); // Specify your DB name
    return { db, client };
}

