const OrderModel = require("../models/OrderModel");
const ProductModel = require("../models/ProductModel");
const { body, validationResult } = require("express-validator");
//helper file to prepare responses.
const apiResponse = require("../helpers/apiResponse");
const utility = require("../helpers/utility");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("../middlewares/jwt");
const mailer = require("../helpers/mailer");
const { constants } = require("../helpers/constants");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);

/**
 * User registration.
 *
 * @param {string}      first_name
 * @param {string}      last_name
 * @param {string}      email_id
 * @param {string}      password
 *
 * @returns {Object}
 */
exports.create = [
  auth,
  // Validate fields.
  body("item_id")
    .isLength({ min: 1 })
    .trim()
    .escape()
    .withMessage("Item Id must be specified.")
    .custom((value) => {
      return ProductModel.findOne({ _id: value }).then((product) => {
        if (!product) {
          return Promise.reject("Invalid Item Id");
        }
      });
    }),
  body("quantity")
    .isLength({ min: 1 })
    .trim()
    .escape()
    .withMessage("Quantity must be specified."),
  body("price")
    .isLength({ min: 1 })
    .trim()
    .escape()
    .withMessage("Price must be specified."),
  body("amount")
    .isLength({ min: 1 })
    .trim()
    .escape()
    .withMessage("Amount must be specified."),
  // Process request after validation and sanitization.
  (req, res) => {
    try {
      // Extract the validation errors from a request.
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // Display sanitized values/errors messages.
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      } else {
        const { _id, ...rest } = req.body;
        var order = new OrderModel({
          user: req.user._id,
          ...rest,
        });
        // Save order.
        order.save(function (err) {
          if (err) {
            return apiResponse.ErrorResponse(res, err);
          }
          let orderData = {
            _id: order._id,
            createdAt: order.createdAt,
          };
          return apiResponse.successResponseWithData(
            res,
            "Order Success.",
            orderData
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
 * Orders List
 */

exports.OrdersList = [
  auth,
  function (req, res) {
    try {
      OrderModel.aggregate([
        {
          $lookup: {
            from: "products",
            localField: "item_id",
            foreignField: "_id",
            as: "item",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "map_user",
          },
        },
        {
          $project: {
            __v: 0,
          },
        },
      ]).then((orders) => {
        if (orders.length > 0) {
          return apiResponse.successResponseWithData(
            res,
            "Operation success",
            orders
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
