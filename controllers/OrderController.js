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
  body("items").isArray().withMessage("Items must be Array of objects."),
  body("items.*.item_id", "Item_id must be a string").exists().isString(),
  body("items.*.quantity", "Quantity must be a number").exists().isInt(),
  body("items.*.price", "Price must be a Decimal").exists().isDecimal(),
  body("items.*.amount", "Amount must be a Decimal").exists().isDecimal(),
  body("total_amount", "Total must be a Decimal").exists().isDecimal(),
  body("email_id", "Total must be a Decimal").exists().isString(),
  body("phone_number", "Total must be a Decimal").exists().isString(),
  body("mailing_address.address1", "Mailing address1 must be entered")
    .exists()
    .isString(),
  body("mailing_address.city", "Mailing City must be entered")
    .exists()
    .isString(),
  body("mailing_address.state", "Mailing State must be entered")
    .exists()
    .isString(),
  body("mailing_address.postcode", "Mailing Postcode Code must be entered")
    .exists()
    .isString(),
  body("shipping_address.address1", "Shipping address1 must be entered")
    .exists()
    .isString(),
  body("shipping_address.city", "Shipping City must be entered")
    .exists()
    .isString(),
  body("shipping_address.state", "Shipping State must be entered")
    .exists()
    .isString(),
  body("shipping_address.postcode", "Shipping Postcode Code must be entered")
    .exists()
    .isString(),
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
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "map_user",
          },
        },
        // {
        //   $lookup: {
        //     from: "products",
        //     localField: "items",
        //     foreignField: "_id",
        //     as: "map_products",
        //   },
        // },
        {
          $match: {
            user: { $eq: mongoose.Types.ObjectId(req.user._id) },
          },
        },
        {
          $project: {
            __v: 0,
            "map_user.password": 0,
            "map_user.createdAt": 0,
            "map_user.updatedAt": 0,
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
