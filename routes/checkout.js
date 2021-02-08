var express = require("express");
const CheckoutController = require("../controllers/CheckoutController");

var router = express.Router();

router.post("/create", CheckoutController.create);
router.get("/", CheckoutController.CheckoutList);

module.exports = router;
