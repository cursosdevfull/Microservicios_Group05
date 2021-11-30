const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/message", async (req, res) => {
  const pathAPIBackend2 =
    process.env.SERVICE_BACKEND2 || "http://localhost:19020/api/message";
  const response = await axios.get(pathAPIBackend2);

  const message01 = "Mensaje enviado desde el backend1";
  const message02 = response.data.message;
  res.json({ message01, message02 });
});

module.exports = router;
