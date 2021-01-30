const CategoryModel = require("../models/CategoryModel");
const { body, validationResult } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);

// Category Schema
function CategoryData(data) {
  this.id = data._id;
  this.category_name = data.category_name;
  this.createdAt = data.createdAt;
}

/**
 * Category List.
 *
 * @returns {Object}
 */
exports.CategoryList = [
  auth,
  function (req, res) {
    try {
      CategoryModel.find({}, "_id category_name status createdAt").then(
        (categories) => {
          if (categories.length > 0) {
            return apiResponse.successResponseWithData(
              res,
              "Operation success",
              categories
            );
          } else {
            return apiResponse.successResponseWithData(
              res,
              "Operation success",
              []
            );
          }
        }
      );
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * Category store.
 *
 * @param {string}      category_name
 *
 * @returns {Object}
 */
exports.CategoryStore = [
  auth,
  body("category_name", "Name must not be empty.")
    .isLength({ min: 3 })
    .withMessage("Minimum 3 characters.")
    .trim()
    .escape()
    .custom((value, { req }) => {
      return CategoryModel.findOne({ category_name: value }).then((cat) => {
        if (cat) {
          return Promise.reject("Category already exist with this name.");
        }
      });
    }),
  (req, res) => {
    try {
      const errors = validationResult(req);
      var category = new CategoryModel({
        category_name: req.body.category_name,
      });

      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      } else {
        //Save Category.
        category.save(function (err) {
          if (err) {
            return apiResponse.ErrorResponse(res, err);
          }
          let Category_Data = new CategoryData(category);
          return apiResponse.successResponseWithData(
            res,
            "Category add Success.",
            Category_Data
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
 * Category update.
 *
 * @param {string}      title
 * @param {string}      description
 * @param {string}      isbn
 *
 * @returns {Object}
 */
exports.CategoryUpdate = [
  auth,
  body("category_name", "Name must not be empty.").isLength({ min: 1 }).trim(),
  body("status", "Status must not be empty.").isLength({ min: 1 }).trim(),
  (req, res) => {
    try {
      const errors = validationResult(req);
      var category = new CategoryModel({
        category_name: req.body.category_name,
        status: req.body.status,
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
          CategoryModel.findById(req.params.id, function (err, foundCategory) {
            if (foundCategory === null) {
              return apiResponse.notFoundResponse(
                res,
                "Category not exists with this id"
              );
            } else {
              //update Category.
              CategoryModel.findByIdAndUpdate(
                req.params.id,
                category,
                {},
                function (err) {
                  if (err) {
                    return apiResponse.ErrorResponse(res, err);
                  } else {
                    let Category_Data = new CategoryData(category);
                    return apiResponse.successResponseWithData(
                      res,
                      "Category update Success.",
                      Category_Data
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
 * Category Delete.
 *
 * @param {string}      id
 *
 * @returns {Object}
 */
exports.CategoryDelete = [
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
      CategoryModel.findById(req.params.id, function (err, foundCategory) {
        if (foundCategory === null) {
          return apiResponse.notFoundResponse(
            res,
            "Category not exists with this id"
          );
        } else {
          //delete Category.
          CategoryModel.findByIdAndRemove(req.params.id, function (err) {
            if (err) {
              return apiResponse.ErrorResponse(res, err);
            } else {
              return apiResponse.successResponse(
                res,
                "Category delete Success."
              );
            }
          });
        }
      });
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];
