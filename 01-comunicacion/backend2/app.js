const express = require("express");
const router = require("./routes/api.route");
const app = express();
const cors = require("cors");

app.use(cors());
app.use("/api", router);

app.get("/health", (req, res) => {
  res.send("Todo está ok");
});

app.get("*", (req, res) => {
  res.status(404).send("Path not found");
});

module.exports = app;
