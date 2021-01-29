var express = require("express");
var authRouter = require("./auth");
var adminRouter = require("./admin");
var categoryRouter = require("./category");
var subCategoryRouter = require("./subcategory");
var stateRouter = require("./state");
var postcodeRouter = require("./postcode");

var app = express();

app.use("/auth/", authRouter);
app.use("/admin/", adminRouter);
app.use("/category/", categoryRouter);
app.use("/subcategory/", subCategoryRouter);
app.use("/state", stateRouter);
app.use("/postcode", postcodeRouter);

module.exports = app;
