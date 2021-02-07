var express = require("express");
const ProductController = require("../controllers/ProductController");

var router = express.Router();

router.get("/", ProductController.ProductList);
router.post("/", ProductController.ProductStore);
router.put("/:id", ProductController.ProductUpdate);
router.delete("/:id/:status", ProductController.ProductDelete);
router.get("/allproducts", ProductController.AllProductList);
router.get("/bycategory/:id", ProductController.ProductListByCategory);
router.get("/bysubcategory/:id", ProductController.ProductListBySubCategory);

module.exports = router;
