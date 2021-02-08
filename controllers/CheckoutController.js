const CheckoutModel = require("../models/CheckoutModel");
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
  body("item_id", "Item_id must be a string").exists().isString(),
  body("quantity", "Quantity must be a number").exists().isInt(),
  body("price", "Price must be a Decimal").exists().isDecimal(),
  body("amount", "Amount must be a Decimal").exists().isDecimal(),
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
        var order = new CheckoutModel({
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
 * Checkout List
 */

exports.CheckoutList = [
  auth,
  function (req, res) {
    try {
      CheckoutModel.aggregate([
        {
          $lookup: {
            from: "products",
            localField: "item_id",
            foreignField: "_id",
            as: "map_product",
          },
        },
        {
          $unwind: "$map_product",
        },
        {
          $match: {
            user: { $eq: mongoose.Types.ObjectId(req.user._id) },
          },
        },
        {
          $project: {
            __v: 0,
          },
        },
      ]).then((orders) => {
        console.log(req.user._id);
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
