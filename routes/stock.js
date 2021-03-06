var express = require("express");
const StockController = require("../controllers/StockController");

var router = express.Router();

router.get("/byproduct/:id", StockController.Product);
router.get("/totalstocks", StockController.AllProducts);

module.exports = router;
