const cors = require("cors");
const fs = require("fs");
const express = require("express");
const multer = require("multer");
const connectToReplicaSet = require("./database");
require("dotenv").config();
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../client/build")));
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});
app.listen(5001);
const args = process.argv.slice(2).map((arg) => arg.toLowerCase());
let dbPreference = "Remote";

if (args.includes("-local") || args.includes("-l")) dbPreference = "Local";
else if (args.includes("-remote") || args.includes("-r"))
  dbPreference = "Remote";

async function getDbConnection() {
  return await connectToReplicaSet(dbPreference);
}

const upload = multer({ storage: multer.memoryStorage() }).single("video");

app.post("/upload-video", (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      return res
        .status(500)
        .json({ flag: false, message: "Upload failed", error: err.message });
    }

    const { courseName, filename, path: customPath } = req.body;

    const uploadDir = customPath
      ? path.join(__dirname, customPath)
      : path.join(__dirname, `../client/src/assets/${courseName}/videos`);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const finalFilename =
      filename || `video_${Date.now()}${path.extname(req.file.originalname)}`;
    const fullPath = path.join(uploadDir, finalFilename);

    fs.writeFile(fullPath, req.file.buffer, (fsErr) => {
      if (fsErr) {
        return res
          .status(500)
          .json({
            flag: false,
            message: "Saving file failed",
            error: fsErr.message,
          });
      }

      res.status(200).json({
        flag: true,
        message: "Video uploaded successfully",
        data: { path: fullPath, filename: finalFilename },
      });
    });
  });
});
app.post("/login", async (req, res) => {
  const { Id, userPass } = req.body.data;
  try {
    const dbConnection = await getDbConnection();
    const result = await dbConnection.getDocument("Users", "Roll No", Id);
    if (result.flag && userPass === result.data[0].Password) {
      res
        .status(200)
        .json({ flag: true, message: "Login successful", data: result.data });
    } else {
      const errorMessage = !result.flag
        ? "User not found"
        : "Incorrect password";
      res.status(401).json({ flag: false, message: errorMessage });
    }
  } catch (error) {
    res.status(500).json({ flag: false, message: "Database connection error" });
  }
});
app.post("/load-data", async (req, res) => {
  const { collection } = req.body.data;
  try {
    const dbConnection = await getDbConnection();
    const result = await dbConnection.loadCollection(collection);
    if (result.flag) {
      res
        .status(200)
        .send({ flag: true, message: result.message, data: result.data });
    } else {
      res.status(401).json({ flag: false, message: "No data found!" });
    }
  } catch (error) {
    res.status(500).json({ flag: false, message: "Database connection error" });
  }
});
app.post("/create-collection", async (req, res) => {
  const { collection } = req.body.data;
  try {
    const dbConnection = await getDbConnection();
    const result = await dbConnection.createCollection(collection);
    if (result.flag) {
      res.status(200).json({ flag: true, message: result.message });
    } else {
      res.status(401).json({ flag: false, message: result.message });
    }
  } catch (error) {
    res.status(500).json({ flag: false, message: "Database connection error" });
  }
});
app.post("/Upload-data", async (req, res) => {
  const { data, collection } = req.body.data;
  try {
    let docs = [];
    const keys = data[0].map((key) =>
      key
        .replace(
          /\w\S*/g,
          (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()
        )
        .trim()
    );
    const records = data.slice(1);
    records.forEach((record) => {
      const values = record.map((value) => value.trim());
      let doc = {};
      values.forEach((value, index) => {
        doc[keys[index].trim()] = value.trim();
      });
      doc["userType"] = "Student";
      doc["Group"] = doc.Department && doc.Department.toUpperCase();
      docs.push(doc);
    });
    const dbConnection = await getDbConnection();
    const result = await dbConnection.insertData(collection, docs);
    if (result.flag) {
      res.status(200).json({
        flag: true,
        insertedCount: result.insertedCount,
        message: result.message,
      });
    } else {
      res.status(401).json({
        flag: false,
        message: result.message,
      });
    }
  } catch (error) {
    console.log("Error occurred while inserting data:", error.message || error);
    res.status(500).json({ flag: false, message: error });
  }
});
app.post("/delete-data", async (req, res) => {
  const { data, collection } = req.body.data;
  try {
    const dbConnection = await getDbConnection();
    const result = await dbConnection.deleteDocument(collection, data);
    if (result.flag) {
      res.status(200).json({
        flag: true,
        message: result.message,
        deletedCount: result.deletedCount,
      });
    } else {
      res.status(401).json({ flag: false, message: result.message });
    }
  } catch (error) {
    res.status(500).json({ flag: false, message: "Database connection error" });
  }
});
app.post("/insert-data", async (req, res) => {
  const { data, collection } = req.body.data;
  try {
    const dbConnection = await getDbConnection();
    const result = await dbConnection.insertDocument(collection, data);
    if (result.flag) {
      res.status(200).json({ flag: true, message: result.message });
    } else {
      res.status(500).json({ flag: false, message: result.message });
    }
  } catch (error) {
    res.status(500).json({ flag: false, message: "Database connection error" });
  }
});
app.post("/find-data", async (req, res) => {
  const { collection, condition } = req.body.data;
  try {
    const dbConnection = await getDbConnection();
    const result = await dbConnection.getDocument(
      collection,
      condition.key,
      condition.value
    );

    if (result.flag) {
      res
        .status(200)
        .json({ flag: true, message: result.message, data: result.data });
    } else {
      res.status(401).json({ flag: false, message: result.message });
    }
  } catch (error) {
    res.status(500).json({ flag: false, message: "Database connection error" });
  }
});
app.post("/update-data", async (req, res) => {
  const { collection, condition, data } = req.body.data;
  try {
    const dbConnection = await getDbConnection();
    const result = await dbConnection.updateDocument(
      collection,
      condition,
      data
    );
    if (result.data.matchedCount > 0) {
      res.status(200).json({
        flag: true,
        matchedCount: result.data.matchedCount,
        modifiedCount: result.data.modifiedCount,
        upsertedCount: result.data.upsertedCount || 0,
      });
    } else {
      res
        .status(401)
        .json({ flag: false, message: "No documents found to update." });
    }
  } catch (error) {
    res.status(500).json({ flag: false, message: "Database connection error" });
  }
});
app.post("/update-score", async (req, res) => {
  const { collection, condition, score, marks, answer, question } =
    req.body.data;

  try {
    const dbConnection = await getDbConnection();
    const result = await dbConnection.getDocument(
      collection,
      condition.key,
      condition.value
    );
    if (result.flag) {
      const updatedTestResults = result.data[0]["Test Results"].map((item) => {
        if (item.Score === score && item.Answer === JSON.stringify(answer)) {
          item.Score += Number(marks);

          let parsedAnswer = JSON.parse(item.Answer);

          parsedAnswer = parsedAnswer.map((answerObj) => {
            if (Object.keys(answerObj)[0] === question) {
              answerObj["Score Added"] = true;
              answerObj["Score"] = Number(marks);
            }
            return answerObj;
          });

          item.Answer = JSON.stringify(parsedAnswer);
        }

        return item;
      });

      const updateData = { "Test Results": updatedTestResults };
      const updateResult = await dbConnection.updateDocument(
        collection,
        { _id: result.data._id },
        updateData
      );
      if (updateResult.flag) {
        res.status(200).json({
          flag: true,
          matchedCount: updateResult.data.matchedCount,
          modifiedCount: updateResult.data.modifiedCount,
          upsertedCount: updateResult.data.upsertedCount || 0,
        });
      } else {
        res
          .status(401)
          .json({ flag: false, message: "No documents found to update." });
      }
    } else {
      res.status(404).json({ flag: false, message: "Test not found." });
    }
  } catch (error) {
    res.status(500).json({ flag: false, message: "Database connection error" });
  }
});
app.post("/push-data", async (req, res) => {
  const { collection, condition, updateData } = req.body.data;
  const dbConnection = await getDbConnection();
  const result = await dbConnection.pushData(collection, condition, updateData);
  if (result.flag) {
    res.status(200).json({ flag: true, message: "Data pushed successfully" });
  } else {
    res.status(500).json({
      flag: false,
      message: result,
      error: result,
    });
  }
});
app.post("/Upload-question", async (req, res) => {
  const { collection, data } = req.body.data;
  const dbConnection = await getDbConnection();
  const result = await dbConnection.insertData(collection, data);
  if (result) {
    res.status(200).json({ message: "Questions uploaded successfully" });
  } else {
    res.status(500).json({ message: "Error inserting data" });
  }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
