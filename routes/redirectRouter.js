const express = require("express");
const urlController = require("../controllers/urlController");

const router = express.Router();

router.get("/:shortCode", urlController.redirectToOriginalUrl);

module.exports = router;
