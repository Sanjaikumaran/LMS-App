// db.js
const { MongoClient } = require("mongodb");

async function connectToReplicaSet() {
  const uri =
    "mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.3.1";

  const client = new MongoClient(uri);

  const db = client.db("Quizzards");

  async function insertData(collectionName, data) {
    try {
      await client.connect();
      console.log("Connected to MongoDB Replica Set");
      const options = { ordered: true };
      const collection = db.collection(collectionName);
      if (Array.isArray(data) && data.length > 1) {
        await collection.insertMany(data, options);
      } else {
        await collection.insertOne(data);
      }
      console.log("Data inserted successfully");
      return true;
    } catch (e) {
      console.error("Error connecting to MongoDB:", e);
      return false;
    } finally {
      await client.close();
    }
  }
  async function loadCollection(collectionName) {
    try {
      const collection = db.collection(collectionName);

      // Use async/await for toArray
      const result = await collection.find({}).toArray();
      return result;
    } catch (e) {
      console.error("Error connecting to MongoDB:", e);
    } finally {
      await client.close(); // Ensure the client closes after operation
    }
  }
  async function getDocument(collectionName, uniqueKey, value) {
    try {
      const collection = db.collection(collectionName);

      // Use square brackets to use the dynamic key
      const result = await collection.findOne({ [uniqueKey]: value });
      delete result._id;
      return result;
    } catch (e) {
      console.error("Error fetching document from MongoDB:", e);
    }
    // Don't close the client here to allow reuse
  }
  async function insertDocument(collectionName, doc) {
    try {
      const collection = db.collection(collectionName);

      // Use square brackets to use the dynamic key
      const result = await collection.insertOne(doc);

      return result;
    } catch (e) {
      console.error("Error fetching document from MongoDB:", e);
    }
    // Don't close the client here to allow reuse
  }
  async function deleteDocument(collectionName, docs) {
    try {
      const collection = db.collection(collectionName);

      // Use $in to match multiple _id values directly as strings
      const result = await collection.deleteMany({ Contact: { $in: docs } });

      return result;
    } catch (e) {
      console.error("Error deleting documents from MongoDB:", e);
      throw e; // Rethrow the error to handle it in the route
    }
  }

  return {
    insertData,
    loadCollection,
    getDocument,
    insertDocument,
    deleteDocument,
  };
}

module.exports = connectToReplicaSet; // Export the connection function
