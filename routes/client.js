var express = require("express");
const ClientController = require("../controllers/ClientController");

var router = express.Router();

router.post("/validate-state-postcode", ClientController.validateStatePostcode);

module.exports = router;
