const express = require("express");
const router = express.Router();

router.get("/config", (req, res) => {
  res.json({
    pathBackend1:
      process.env.SERVICE_BACKEND1 || "http://localhost:19010/api/message",
  });
});

module.exports = router;
