var express = require("express");
const OrderController = require("../controllers/OrderController");

var router = express.Router();

router.post("/create", OrderController.create);
// router.post("/login", OrderController.login);
// router.put("/update/:id", OrderController.UserUpdate);
// router.get("/getbyid/:id", OrderController.getUserById);
router.get("/", OrderController.OrdersList);
// router.put("/update-password/:id", OrderController.UserUpdatePassword);
// router.post("/verify-otp", OrderController.verifyConfirm);
// router.post("/resend-verify-otp", OrderController.resendConfirmOtp);

module.exports = router;
