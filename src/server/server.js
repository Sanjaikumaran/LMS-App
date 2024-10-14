// server.js
const os = require("os");
const cors = require("cors");
const express = require("express");
const session = require("express-session");
const connectToReplicaSet = require("./database"); // Import the DB connection

const app = express();
app.use(cors());
app.use(express.json());
app.use(
  session({
    secret: "jeppiaarUniversity", // Replace with a secure secret key
    resave: false,
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

app.get("/data", async (req, res) => {
  let address = [];
  const localIPs = await getLocalIPs();

  for (const obj of localIPs) {
    address.push(obj.address);
  }

  res.json(address);
});

app.post("/Upload-file", async (req, res) => {
  let docs = [];
  const data = req.body.data.split("\n");
  const keys = data[0].split(",");
  const records = data.slice(1);
  records.forEach((record, i) => {
    const values = record.split(",");
    let doc = {};

    values.forEach((value, index) => {
      try {
        doc[keys[index].trim()] = value.trim();
      } catch (error) {}
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
app.post("/load-data", async (req, res) => {
  const dbConnection = await connectToReplicaSet();
  const result = await dbConnection.loadCollection("Users");

  if (result) {
    res.status(200).send(result);
  } else {
    res.status(500).json({ message: "Error loading data" });
  }
});
// Login route
app.post("/login", async (req, res) => {
  const Id = req.body.Id;
  const userPass = req.body.password;

  const dbConnection = await connectToReplicaSet();
  const result = await dbConnection.getDocument("Users", "Contact", Id);

  if (result) {
    if (userPass === result.Gender) {
      req.session["userData"] = result; // Store user data in session
      res.status(200).send(true);
    } else {
      res.status(401).json({ message: "Incorrect password" });
    }
  } else {
    res.status(500).json({ message: "Error getting data" });
  }
});

app.post("/profile", (req, res) => {
  if (req.session["userData"]) {
    res.status(200).json(req.session["userData"]);
  } else {
    res.status(401).json({ message: "User not logged in" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
