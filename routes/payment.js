const express = require("express");
const router = express.Router();
var eway = require("../helpers/eway");

router.get("/", eway.getAccessCode);
router.get("/cancel", eway.getAccessCode);

module.exports = router;
