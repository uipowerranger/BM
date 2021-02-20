var express = require("express");
const CheckoutController = require("../controllers/CheckoutController");

var router = express.Router();

router.post("/create", CheckoutController.create);
router.get("/", CheckoutController.CheckoutList);
router.delete("/:id", CheckoutController.delete);
router.post("/delete-user", CheckoutController.deleteByUser);

module.exports = router;
