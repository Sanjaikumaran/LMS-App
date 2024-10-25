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
      const options = { ordered: true };
      const collection = db.collection(collectionName);
      let result;
      if (Array.isArray(data) && data.length > 1) {
        result = await collection.insertMany(data, options);
      } else {
        await collection.insertOne(data);
      }

      return result;
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
      console.log("Error fetching document from MongoDB:", e);
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
      let result;
      // Use $in to match multiple _id values directly as strings
      if (collectionName === "Users") {
        result = await collection.deleteMany({ Contact: { $in: docs } });
      } else {
        docs = docs.map((doc) => doc.split(",")); // Convert each string to an array

        result = await collection.deleteMany({
          Answer: { $in: docs },
        });
      }

      return result;
    } catch (e) {
      console.error("Error deleting documents from MongoDB:", e);
      throw e; // Rethrow the error to handle it in the route
    }
  }
  async function findDocument(collectionName, docs) {
    try {
      const collection = db.collection(collectionName);

      const result = await collection.findOne(docs);

      return result;
    } catch (e) {
      console.error("Error finding documents from MongoDB:", e);
      throw e; // Rethrow the error to handle it in the route
    }
  }
  async function updateDocument(collectionName, filter, docs) {
    try {
      const collection = db.collection(collectionName);

      const result = await collection.updateOne(filter, { $set: docs });

      return result;
    } catch (e) {
      console.error("Error finding documents from MongoDB:", e);
      throw e; // Rethrow the error to handle it in the route
    }
  }
  return {
    insertData,
    loadCollection,
    getDocument,
    insertDocument,
    deleteDocument,
    findDocument,
    updateDocument,
  };
}

module.exports = connectToReplicaSet; // Export the connection function
//{name: "Annu"}, {$set:{age:25}}
