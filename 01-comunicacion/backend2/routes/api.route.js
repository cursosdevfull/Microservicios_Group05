const express = require("express");
const router = express.Router();

router.get("/message", (req, res) => {
  res.json({ message: "Mensaje enviado desde el backend2" });
});

module.exports = router;
