var express = require("express");
const AdminController = require("../controllers/AdminController");

var router = express.Router();

router.post("/register", AdminController.register);
router.post("/login", AdminController.login);
router.put("/update/:id", AdminController.AdminUpdate);
router.put("/update-password/:id", AdminController.AdminUpdatePassword);
router.post("/verify-otp", AdminController.verifyConfirm);
router.post("/resend-verify-otp", AdminController.resendConfirmOtp);

module.exports = router;
