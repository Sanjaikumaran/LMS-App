// server.js
const os = require("os");
const cors = require("cors");
const express = require("express");
const connectToReplicaSet = require("./database"); // Import the DB connection

const app = express();
app.use(cors());
app.use(express.json());

function getLocalIPs() {
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

app.get("/data", (req, res) => {
  let address = [];
  getLocalIPs().forEach((obj) => {
    address.push(obj.address);
  });
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
      doc[keys[index].replace("'", "").trim()] = value.trim();
    });
    docs.push(doc);
  });

  const dbConnection = await connectToReplicaSet();
  const result = await dbConnection.insertData("Students", docs);
  if (result) {
    res.status(200).json({ message: "Data inserted successfully" });
  } else {
    res.status(500).json({ message: "Error inserting data" });
  }
});
app.post("/load-data", async (req, res) => {
  const dbConnection = await connectToReplicaSet();
  const result = await dbConnection.loadCollection("Students");
  if (result) {
    res.status(200).json({ message: "Data loaded." });
  } else {
    res.status(500).json({ message: "Error inserting data" });
  }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
