const { MongoClient } = require('mongodb');

// Connection URL for local MongoDB
const url = 'mongodb://localhost:27017'; // Change this if you have a different local setup
const client = new MongoClient(url);

// Database and Collection name
const dbName = 'myDatabase';
const collectionName = 'myCollection';

async function main() {
    try {
        // Connect to MongoDB
        await client.connect();
        console.log("Connected successfully to MongoDB");

        // Get database and collection
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // Insert a document
        //const insertResult = await collection.insertOne({ name: "Alice", age: 28 });
        //console.log("Inserted document:", insertResult.insertedId);

        // Fetch all documents
        const documents = await collection.find({}).toArray();
        console.log("Documents found:", documents);

    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    } finally {
        // Close the connection
        await client.close();
    }
}

main().catch(console.error);
