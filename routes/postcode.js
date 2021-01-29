var express = require("express");
const PostCodeController = require("../controllers/PostCodeController");

var router = express.Router();

router.get("/", PostCodeController.PostcodeList);
router.post("/", PostCodeController.PostcodeStore);
router.put("/:id", PostCodeController.PostcodeUpdate);
router.delete("/:id", PostCodeController.PostcodeDelete);

module.exports = router;
