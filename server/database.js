const { MongoClient, ObjectId } = require("mongodb");

const uriRemote =
  "mongodb+srv://sanjaikumaran0311:RdJEe2tpfl3P931q@cluster0.vek3x.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const uriLocal =
  "mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.3.1";

async function connectToMongo(uri) {
  const client = new MongoClient(uri);
  await client.connect();
  return client;
}

const setupDb = async (preferred = "Remote") => {
  let client;
  let db;

  const tryConnect = async (uri) => {
    try {
      const client = await connectToMongo(uri);
      console.log(`Connected to MongoDB at ${preferred}`);

      return client;
    } catch {
      return null;
    }
  };

  if (preferred === "Local") {
    client = (await tryConnect(uriLocal)) || (await tryConnect(uriRemote));
  } else {
    client = (await tryConnect(uriRemote)) || (await tryConnect(uriLocal));
  }

  if (!client) {
    console.error("Failed to connect to both remote and local MongoDB.");
    return { error: true, message: "Couldn't connect to any MongoDB" };
  }

  db = client.db("Quizzards");

  try {
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((col) => col.name);

    if (!collectionNames.includes("Tests")) await db.createCollection("Tests");
    if (!collectionNames.includes("Questions"))
      await db.createCollection("Questions");
    if (!collectionNames.includes("Courses"))
      await db.createCollection("Courses");
    if (!collectionNames.includes("Users")) {
      await db.createCollection("Users");
      await db.collection("Users").insertOne({
        Name: "Admin",
        Password: "admin",
        "Roll No": "admin",
        userType: "Admin",
      });
    }

    return db;
  } catch (err) {
    return { error: err, message: "Error during DB setup" };
  }
};

async function connectToReplicaSet(preferred = "Remote") {
  const db = await setupDb(preferred);
  if (!db || db.error) {
    return { error: true, message: "Couldn't connect to MongoDB" };
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
          insertedCount: result.insertedCount || 1,
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
      const objectIds = docs.map((doc) => doc && new ObjectId(doc));

      const result = await collection.deleteMany({
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
      const filter =
        uniqueKey === "_id"
          ? { _id: new ObjectId(value) }
          : { [uniqueKey]: value };

      const result = await collection.find(filter).toArray();

      if (result.length > 0) {
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

  async function updateDocument(collectionName, filter, docs, options = {}) {
    try {
      const collection = db.collection(collectionName);
      const updateOptions = options.multi ? { multi: true } : {};

      const result = await collection.updateOne(
        { _id: new ObjectId(filter._id) },
        { $set: docs },
        updateOptions
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

  async function pushData(collectionName, condition, updateData) {
    try {
      const collection = db.collection(collectionName);

      const result = await collection.updateOne(
        { _id: new ObjectId(condition._id) },
        {
          $push: updateData,
        }
      );

      if (result.acknowledged && result.modifiedCount > 0) {
        return {
          flag: true,
          message: "Data pushed successfully",
          data: result,
        };
      } else {
        return { flag: false, message: "Couldn't push data", data: result };
      }
    } catch (error) {
      return { flag: false, message: error.message };
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
    pushData,
  };
}

module.exports = connectToReplicaSet;
