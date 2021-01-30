const ProductModel = require("../models/ProductModel");
const AllCategoryModel = require("../models/CategoryModel");
const AllStateModel = require("../models/StateModel");
const { body, validationResult } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
const moment = require("moment");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);

// Category Schema
function ProductData(data) {
  this._id = data._id;
  this.category_details = data.category_details;
  this.item_name = data.item_name;
  this.items_available = data.items_available;
  this.post_code_details = data.post_code_details;
  this.price = data.price;
  this.state_details = data.state_details;
  this.sub_category_details = data.sub_category_details;
  this.weight = data.weight;
  this.offer_from_date = data.offer_from_date;
  this.offer_to_date = data.offer_to_date;
  this.deal_details = data.deal_details;
  this.offer_details = data.offer_details;
  this.has_deal = data.has_deal;
  this.has_offer = data.has_offer;
  this.home_page_display = data.home_page_display;
  this.image = data.image;
  this.createdAt = data.createdAt;
}

/**
 * Product List.
 *
 * @returns {Object}
 */
exports.ProductList = [
  auth,
  function (req, res) {
    try {
      ProductModel.aggregate([
        {
          $lookup: {
            from: "categories",
            localField: "category_details",
            foreignField: "_id",
            as: "map_category",
          },
        },
        {
          $unwind: "$map_category",
        },
        {
          $lookup: {
            from: "sub_categories",
            localField: "sub_category_details",
            foreignField: "_id",
            as: "map_sub_category",
          },
        },
        {
          $unwind: "$map_sub_category",
        },
        {
          $lookup: {
            from: "states",
            localField: "state_details",
            foreignField: "_id",
            as: "map_state",
          },
        },
        {
          $unwind: "$map_state",
        },
        {
          $lookup: {
            from: "postcodes",
            localField: "post_code_details",
            foreignField: "_id",
            as: "map_postcode",
          },
        },
        {
          $unwind: "$map_postcode",
        },
        {
          $project: {
            __v: 0,
          },
        },
      ]).then((products) => {
        if (products.length > 0) {
          return apiResponse.successResponseWithData(
            res,
            "Operation success",
            products
          );
        } else {
          return apiResponse.successResponseWithData(
            res,
            "Operation success",
            []
          );
        }
      });
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * Product store.
 *
 * @param {string}      category_name
 *
 * @returns {Object}
 */
exports.ProductStore = [
  auth,
  body("item_name", "Name must not be empty.")
    .isLength({ min: 3 })
    .withMessage("Minimum 3 characters.")
    .trim()
    .escape(),
  body("price", "Price must not be empty.")
    .isLength({ min: 1 })
    .withMessage("Minimum 3 characters.")
    .trim(),
  body("weight", "Weight must not be empty.")
    .isLength({ min: 1 })
    .withMessage("Minimum 3 characters.")
    .trim(),
  body("items_available", "Items vailable must not be empty.")
    .isLength({ min: 1 })
    .withMessage("Minimum 3 characters.")
    .trim(),
  body("category_details", "Category must not be empty")
    .isLength({ min: 1 })
    .trim()
    .custom((value, { req }) => {
      return AllCategoryModel.findOne({ _id: value }).then((cat) => {
        if (!cat) {
          return Promise.reject("Enter valid category ID");
        }
      });
    }),
  body("sub_category_details", "Sub Category must not be empty.")
    .isLength({ min: 3 })
    .withMessage("Minimum 3 characters.")
    .trim()
    .escape(),
  body("state_details", "State must not be empty")
    .isLength({ min: 1 })
    .trim()
    .custom((value, { req }) => {
      return AllStateModel.findOne({ _id: value }).then((cat) => {
        if (!cat) {
          return Promise.reject("Enter valid State ID");
        }
      });
    }),
  body("post_code_details", "Post Code must not be empty.")
    .isLength({ min: 3 })
    .withMessage("Minimum 3 characters.")
    .trim()
    .escape(),
  (req, res) => {
    try {
      const errors = validationResult(req);
      const { _id, ...rest } = req.body;
      var product = new ProductModel({
        user: req.user,
        ...rest,
      });
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      } else {
        //Save Product.
        product.save(function (err) {
          if (err) {
            return apiResponse.ErrorResponse(res, err);
          }
          let Product_Data = new ProductData(product);
          return apiResponse.successResponseWithData(
            res,
            "Product add Success.",
            Product_Data
          );
        });
      }
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * Product update.
 *
 * @param {string}      title
 * @param {string}      description
 * @param {string}      isbn
 *
 * @returns {Object}
 */
exports.ProductUpdate = [
  auth,
  body("item_name", "Name must not be empty.").isLength({ min: 1 }).trim(),
  (req, res) => {
    try {
      const errors = validationResult(req);
      var product = new ProductModel({
        ...req.body,
        _id: req.params.id,
      });

      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      } else {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
          return apiResponse.validationErrorWithData(
            res,
            "Invalid Error.",
            "Invalid ID"
          );
        } else {
          ProductModel.findById(req.params.id, function (err, foundProduct) {
            if (foundProduct === null) {
              return apiResponse.notFoundResponse(
                res,
                "Product not exists with this id"
              );
            } else {
              //update Category.
              ProductModel.findByIdAndUpdate(
                req.params.id,
                product,
                {},
                function (err) {
                  if (err) {
                    return apiResponse.ErrorResponse(res, err);
                  } else {
                    let product_data = new ProductData(product);
                    return apiResponse.successResponseWithData(
                      res,
                      "Product update Success.",
                      product_data
                    );
                  }
                }
              );
            }
          });
        }
      }
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * Product Delete.
 *
 * @param {string}      id
 *
 * @returns {Object}
 */
exports.ProductDelete = [
  auth,
  function (req, res) {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return apiResponse.validationErrorWithData(
        res,
        "Invalid Error.",
        "Invalid ID"
      );
    }
    try {
      ProductModel.findById(req.params.id, function (err, foundProduct) {
        if (foundProduct === null) {
          return apiResponse.notFoundResponse(
            res,
            "Product not exists with this id"
          );
        } else {
          //delete Product.
          ProductModel.findByIdAndUpdate(
            req.params.id,
            { status: req.params.status },
            function (err) {
              if (err) {
                return apiResponse.ErrorResponse(res, err);
              } else {
                return apiResponse.successResponse(
                  res,
                  "Product status update Success."
                );
              }
            }
          );
        }
      });
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];
