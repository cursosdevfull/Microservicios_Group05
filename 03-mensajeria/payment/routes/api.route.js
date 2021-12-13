const express = require("express");
const router = express.Router();
const sendMessage = require("../queue");

router.get("/health", (req, res) => res.send("I am alive!"));

router.post("/payment", (req, res) => {
  const { token, amount, name, email } = req.body;

  setTimeout(() => {
    sendMessage({ token, amount, name, email });
    res.send("Payment proccesed!");
  }, 3000);
});

module.exports = router;
