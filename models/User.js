import { connectToDatabase } from "../../utils/mongodb"; // Adjust the path if needed

// Handle both GET and POST requests for users
export default async function handler(req, res) {
    // Handle GET request: Fetch user by email
    if (req.method === "GET") {
        const { email } = req.query; // Get email from query parameters

        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        try {
            const { db } = await connectToDatabase();
            const user = await db.collection("Users").findOne({ email }); // Query by email

            if (user) {
                return res.status(200).json({ user });
            } else {
                return res.status(404).json({ user: null }); // If no user found
            }
        } catch (error) {
            console.error("Error fetching user:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    // Handle POST request: Create new user
    else if (req.method === "POST") {
        const { email, userId, virtualBalance } = req.body;

        // Ensure all required fields are provided
        if (!email || !userId || virtualBalance === undefined) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        try {
            const { db } = await connectToDatabase();
            const existingUser = await db.collection("Users").findOne({ email });

            if (existingUser) {
                return res.status(409).json({ error: "User already exists" });
            }

            const newUser = {
                userId,
                email,
                virtualBalance,
                createdAt: new Date(),
            };

            await db.collection("Users").insertOne(newUser); // Insert the new user into MongoDB

            return res.status(201).json({ user: newUser });
        } catch (error) {
            console.error("Error creating user:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    // If the method is neither GET nor POST
    else {
        res.status(405).json({ error: "Method Not Allowed" });
    }
}
