var express = require("express");
const OrderController = require("../controllers/OrderController");

var router = express.Router();

router.post("/create", OrderController.create);
router.get("/", OrderController.OrdersList);

module.exports = router;
