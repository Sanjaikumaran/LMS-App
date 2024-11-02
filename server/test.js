/**
 * express.js
 *
 * @author: Harish Anchu <harishanchu@gmail.com>
 * @copyright 2015, Harish Anchu. All rights reserved.
 * @license Licensed under MIT
 */

const NodeSession = require("node-session");
const express = require("express");
const parseurl = require("parseurl");
const cors = require("cors");
const nodeSession = new NodeSession({
  secret: "Q3UBzdH9GEfiRCTKbi5MTPyChpzXLsTD",
});

const sessionMiddleware = (req, res, next) => {
  nodeSession.startSession(req, res, next);
};

const app = express();
app.use(cors());
app.use(sessionMiddleware);

app.use((req, res, next) => {
  req.session.set("views", "jsvf");

  next();
});

app.get("/foo", (req, res) => {
  req.session.set("views", "dsf");
  res.send("s");
});

app.get("/bar", (req, res) => {
  res.send(`You viewed this page ${req.session.get("views") || 0} times`);
});

app.listen(3200, () => {
  console.log("Server is running on port 3000");
});
