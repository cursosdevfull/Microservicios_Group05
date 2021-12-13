const express = require("express");
const app = express();
const cors = require("cors");
const router = require("./routes/api.route");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", router);

app.use("*", (req, res) => res.send("Path not found"));

module.exports = app;
