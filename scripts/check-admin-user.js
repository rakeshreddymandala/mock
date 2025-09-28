import { MongoClient } from "mongodb";

async function checkAdminUser() {
    let client;
    try {
        console.log("Connecting to MongoDB...");

        // Use the exact same connection string from .env
        client = new MongoClient("mongodb+srv://vemunoorinaveen:xNtdAGnnloPmZijS@cluster0.sov7vd7.mongodb.net/");
        await client.connect();
        console.log("Connected to MongoDB");

        const db = client.db("humaneq-hr");
        const usersCollection = db.collection("users");

        console.log("Checking for admin user...");
        const adminUser = await usersCollection.findOne({
            email: "admin@humaneqhr.com",
            role: "admin"
        });

        if (adminUser) {
            console.log("Admin user found:");
            console.log({
                id: adminUser._id,
                email: adminUser.email,
                role: adminUser.role,
                name: adminUser.name,
                hasPassword: !!adminUser.password,
                passwordLength: adminUser.password?.length
            });
        } else {
            console.log("Admin user NOT found");

            // Check if any users exist
            const allUsers = await usersCollection.find({}).toArray();
            console.log("Total users in database:", allUsers.length);

            if (allUsers.length > 0) {
                console.log("Sample users:", allUsers.map(u => ({
                    email: u.email,
                    role: u.role,
                    name: u.name
                })));
            }
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        if (client) {
            await client.close();
        }
    }
}

checkAdminUser();