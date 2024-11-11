const { MongoClient, ObjectId } = require("mongodb");

async function connectToReplicaSet() {
  const uri =
    "mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.3.1";
  const client = new MongoClient(uri);
  let db;

  try {
    await client.connect();
    db = client.db("Quizzards");

    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((col) => col.name);

    if (!collectionNames.includes("Tests")) {
      await db.createCollection("Tests");
    }
    if (!collectionNames.includes("Users")) {
      await db.createCollection("Users");
    }
  } catch (err) {
    return handleError(err, "Couldn't connect to MongoDB");
  }

  function handleError(err, customMessage) {
    return { error: customMessage };
  }
  async function createCollection(collectionName) {
    try {
      const collections = await db.listCollections().toArray();
      const collectionExists = collections.some(
        (collection) => collection.name === collectionName
      );

      if (collectionExists) {
        return { flag: false, message: "Collection already exists" };
      }

      const collection = db.collection(collectionName);
      const result = await collection.createIndexes([
        { key: { Title: 1 }, unique: true },
      ]);
      console.log(result[0]);

      if (result[0]) {
        return {
          flag: true,
          message: "Collection created successfully",
        };
      } else {
        return { flag: false, message: "Couldn't create collection" };
      }
    } catch (e) {
      return { flag: false, message: e.message };
    }
  }

  async function loadCollection(collectionName) {
    try {
      const collection = db.collection(collectionName);
      const result = await collection.find({}).toArray();

      if (result.length > 0) {
        delete result._id;
        return {
          flag: true,
          message: "Data loaded successfully",
          data: result,
        };
      } else {
        return { flag: false, message: "No data found" };
      }
    } catch (e) {
      return { flag: false, message: e.message };
    }
  }

  async function insertData(collectionName, data) {
    try {
      const collection = db.collection(collectionName);
      const options = { ordered: true };
      let result;
      if (Array.isArray(data) && data.length > 1) {
        result = await collection.insertMany(data, options);
      } else {
        result = await collection.insertOne(data);
      }

      if (result.acknowledged) {
        return {
          flag: true,
          message: "Data inserted successfully",
          insertedCount: result.insertedCount,
        };
      } else {
        return { flag: false, message: "Couldn't insert data" };
      }
    } catch (e) {
      return { flag: false, message: e.message };
    }
  }

  async function deleteDocument(collectionName, docs) {
    try {
      const collection = db.collection(collectionName);
      let result;

      const objectIds = docs.map((doc) => new ObjectId(doc));

      result = await collection.deleteMany({
        _id: { $in: objectIds },
      });

      if (result.acknowledged) {
        return {
          flag: true,
          message: "Documents deleted successfully",
          deletedCount: result.deletedCount,
        };
      } else {
        return { flag: false, message: "No documents found to delete." };
      }
    } catch (e) {
      return { flag: false, message: e.message };
    }
  }

  async function getDocument(collectionName, uniqueKey, value) {
    try {
      const collection = db.collection(collectionName);
      const result = await collection.findOne({ [uniqueKey]: value });

      if (result._id) {
        return { flag: true, message: "Data found successfully", data: result };
      } else {
        return { flag: false, message: "No data found" };
      }
    } catch (e) {
      return { flag: false, message: e.message };
    }
  }

  async function insertDocument(collectionName, doc) {
    try {
      const collection = db.collection(collectionName);
      const result = await collection.insertOne(doc);

      if (result.acknowledged) {
        return {
          flag: true,
          message: "Document inserted successfully",
        };
      } else {
        return { flag: false, message: "Couldn't insert document" };
      }
    } catch (e) {
      return { flag: false, message: e.message };
    }
  }

  async function updateDocument(collectionName, filter, docs) {
    try {
      const collection = db.collection(collectionName);
      const result = await collection.updateOne(
        { _id: new ObjectId(filter._id) },
        { $set: docs }
      );

      if (result.acknowledged) {
        return {
          flag: true,
          message: "Document updated successfully",
          data: result,
        };
      } else {
        return { flag: false, message: "Couldn't update document" };
      }
    } catch (e) {
      return { flag: false, message: e.message };
    }
  }

  return {
    createCollection,
    insertData,
    loadCollection,
    getDocument,
    insertDocument,
    deleteDocument,

    updateDocument,
  };
}

module.exports = connectToReplicaSet;
