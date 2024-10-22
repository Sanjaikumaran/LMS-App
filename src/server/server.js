const os = require("os");
const cors = require("cors");
const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const connectToReplicaSet = require("./database"); // Import the DB connection

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: "jeppiaarUniversity", // Replace with a secure secret key
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false }, // For production, set secure: true and use HTTPS
  })
);

async function getLocalIPs() {
  const networkInterfaces = os.networkInterfaces();
  let localIPs = [];

  for (const iface in networkInterfaces) {
    const ifaceDetails = networkInterfaces[iface];
    for (const detail of ifaceDetails) {
      if (detail.family === "IPv4" && !detail.internal) {
        localIPs.push({ interface: iface, address: detail.address });
      }
    }
  }

  return localIPs;
}

// Route to get local IPs
app.get("/data", async (req, res) => {
  const localIPs = await getLocalIPs();
  const address = localIPs.map((obj) => obj.address);
  res.json(address);
});

// Route to upload and insert data
app.post("/Upload-file", async (req, res) => {
  let docs = [];
  const data = req.body.data.split("\n");
  const keys = data[0].split(",");
  const records = data.slice(1);

  records.forEach((record) => {
    const values = record.split(",");
    let doc = {};

    values.forEach((value, index) => {
      doc[keys[index].trim()] = value.trim();
    });

    docs.push(doc);
  });

  const dbConnection = await connectToReplicaSet();
  const result = await dbConnection.insertData("Users", docs);

  if (result) {
    res.status(200).json({ message: "Data inserted successfully" });
  } else {
    res.status(500).json({ message: "Error inserting data" });
  }
});

// Route to load all data from the "Users" collection
app.post("/load-data", async (req, res) => {
  const collection = req.body.collection;

  const dbConnection = await connectToReplicaSet();

  const result = await dbConnection.loadCollection(collection);

  if (result) {
    res.status(200).send(result);
  } else {
    res.status(500).json({ message: "Error loading data" });
  }
});
app.post("/insert-data", async (req, res) => {
  const data = req.body;

  const dbConnection = await connectToReplicaSet();
  const result = await dbConnection.insertDocument("Users", data.data);

  if (result) {
    res.status(200).send(result);
  } else {
    res.status(500).json({ message: "Error loading data" });
  }
});
app.post("/delete-data", async (req, res) => {
  const data = req.body.data; // Assuming this is an array of IDs to delete

  try {
    const dbConnection = await connectToReplicaSet();
    const result = await dbConnection.deleteDocument("Users", data);

    if (result) {
      res.status(200).json({
        message: "Documents deleted successfully.",
        deletedCount: result.deletedCount,
      });
    } else {
      res.status(405).json({ message: "No documents found to delete." });
    }
  } catch (error) {
    console.error("Error in deletion route:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Login route
app.post("/login", async (req, res) => {
  const { Id, password: userPass } = req.body;

  const dbConnection = await connectToReplicaSet();
  const result = await dbConnection.getDocument("Users", "Contact", Id);

  if (result) {
    if (userPass === result.Gender) {
      res.status(200).json(result);
    } else {
      res.status(401).json({ message: "Incorrect password" });
    }
  } else {
    res.status(500).json({ message: "Error getting data" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
