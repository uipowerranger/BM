var express = require("express");
const AdminController = require("../controllers/AdminController");

var router = express.Router();

router.post("/register", AdminController.register);
router.post("/login", AdminController.login);
router.post("/verify-otp", AdminController.verifyConfirm);
router.post("/resend-verify-otp", AdminController.resendConfirmOtp);

module.exports = router;
