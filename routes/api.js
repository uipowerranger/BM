var express = require("express");
var authRouter = require("./auth");
var adminRouter = require("./admin");
var categoryRouter = require("./category");
var subCategoryRouter = require("./subcategory");
var stateRouter = require("./state");
var postcodeRouter = require("./postcode");
var productsRouter = require("./products");

var app = express();

app.use("/auth/", authRouter);
app.use("/admin/", adminRouter);
app.use("/category/", categoryRouter);
app.use("/subcategory/", subCategoryRouter);
app.use("/state", stateRouter);
app.use("/postcode", postcodeRouter);
app.use("/products", productsRouter);

module.exports = app;
