const os = require("os");
const cors = require("cors");
const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const connectToReplicaSet = require("./database"); // Import the DB connection
require("dotenv").config();
const fs = require("node:fs");

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

function getLocalIPs() {
  const interfaces = os.networkInterfaces();
  const ips = [];

  for (const iface of Object.values(interfaces)) {
    for (const alias of iface) {
      if (alias.family === "IPv4" && !alias.internal) {
        ips.push(alias.address); // Collect only external IPv4 addresses
      }
    }
  }

  return ips;
}

// Read the existing .env file
fs.readFile("../../.env", "utf8", (err, data) => {
  if (err) {
    console.error(err);
    return;
  }

  const localIPs = getLocalIPs(); // Get array of local IP addresses
  let address = ""; // Initialize a string to hold the IP entries

  // Loop through local IPs and assign LOCAL_IP1, LOCAL_IP2, etc.
  localIPs.forEach((ip, index) => {
    address += `REACT_APP_LOCAL_IP${index + 1}=${ip}\n`; // Create numbered IP entries
  });

  // Append the IP addresses to the .env file
  fs.writeFile("../../.env", address, (err) => {
    if (err) {
      console.error(err);
    } else {
    }
  });
});
// Route to upload and insert data
app.post("/Upload-data", async (req, res) => {
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
app.post("/Upload-question", async (req, res) => {
  const collection = req.body.collection;
  const questions = req.body.questions;

  const dbConnection = await connectToReplicaSet();

  const result = await dbConnection.insertData(collection, questions);

  if (result) {
    res.status(200).json({ message: "Questions uploaded successfully" });
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
  const result = await dbConnection.insertDocument(data.collection, data.data);

  if (result) {
    res.status(200).send(result);
  } else {
    res.status(500).json({ message: "Error loading data" });
  }
});
app.post("/delete-data", async (req, res) => {
  const data = req.body;

  try {
    const dbConnection = await connectToReplicaSet();
    const result = await dbConnection.deleteDocument(
      data.collection,
      data.data
    );

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
app.post("/find-data", async (req, res) => {
  const data = req.body;

  try {
    const dbConnection = await connectToReplicaSet();
    const result = await dbConnection.findDocument(
      data.collection,
      data.condition
    );

    if (result) {
      res.status(200).json({ result });
    } else {
      res.status(405).json({ message: "No documents found to delete." });
    }
  } catch (error) {
    console.error("Error in deletion route:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});
app.post("/update-data", async (req, res) => {
  const data = req.body;

  try {
    const dbConnection = await connectToReplicaSet();
    const result = await dbConnection.updateDocument(
      data.collection,
      data.condition,
      data.data
    );

    if (result.matchedCount > 0) {
      res.status(200).json({
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
        upsertedCount: result.upsertedCount || 0,
      });
    } else {
      res.status(404).json({ message: "No documents found to update." });
    }
  } catch (error) {
    console.error("Error in update route:", error);
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
