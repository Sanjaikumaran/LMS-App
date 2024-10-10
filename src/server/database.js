// db.js
const { MongoClient } = require("mongodb");

async function connectToReplicaSet() {
  const uri =
    "mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.3.1";

  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

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
      await collection.find({}).toArray(function (err, result) {
        if (err) throw err;
        console.log(result);
      });
    } catch (e) {
      console.error("Error connecting to MongoDB:", e);
    } finally {
      await db.close();
    }
  }
  return { insertData, loadCollection };
}

module.exports = connectToReplicaSet; // Export the connection function
