const OrderModel = require("../models/OrderModel");
const ProductModel = require("../models/ProductModel");
const { body, validationResult } = require("express-validator");
//helper file to prepare responses.
const apiResponse = require("../helpers/apiResponse");
const utility = require("../helpers/utility");
const jwt = require("jsonwebtoken");
const auth = require("../middlewares/jwt");
const mailer = require("../helpers/mailer");
const eway = require("../helpers/eway");
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
  body("items.*.item_name", "Item name must be a string").exists().isString(),
  body("items.*.item_image", "Item image must be a string").exists().isString(),
  body("items.*.quantity", "Quantity must be a number").exists().isInt(),
  body("items.*.price", "Price must be a Decimal").exists().isDecimal(),
  body("items.*.amount", "Amount must be a Decimal").exists().isDecimal(),
  body("total_amount", "Total must be a Decimal").exists().isDecimal(),
  body("email_id", "Email is required").exists().isString(),
  body("phone_number", "Phone number is required").exists().isString(),
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
        let html = "<p>Your order details:</p><p></p>";
        html =
          html +
          "<table width='600px' border='1' cellspacing='0'><thead><tr><th>Item</th><th>Quantity</th><th>Price</th></tr></thead><tbody>";
        let orders = req.body.items.map((it) => {
          return (
            "<tr><td>" +
            it.item_name +
            "</td><td style='align-items:center'>" +
            it.quantity +
            "</td><td style='align-items:center'>" +
            it.price +
            "</td></tr>"
          );
        });
        html = html + orders.join("");
        html = html + "</tbody></table><p>Thanks,</p><p>BirlaMart</p>";

        eway
          .payment(1000)
          .then(function (response) {
            if (response.getErrors().length == 0) {
              var redirectURL = response.get("SharedPaymentUrl");
              order.save(function (err) {
                if (err) {
                  return apiResponse.ErrorResponse(res, err);
                }
                let orderData = {
                  _id: order._id,
                  createdAt: order.createdAt,
                  redirectURL: redirectURL,
                };
                return apiResponse.successResponseWithData(
                  res,
                  "Order Success.",
                  orderData
                );
              });
            } else {
              return apiResponse.ErrorResponse(res, response.getErrors());
            }
          })
          .catch(function (reason) {
            reason.getErrors().forEach(function (error) {
              console.log("Response Messages: " + (error, "en"));
            });
            return apiResponse.ErrorResponse(res, reason.getErrors());
          });
        // Send confirmation email
        // mailer
        //   .send(
        //     constants.confirmEmails.from,
        //     req.user.email_id,
        //     "Your Order on Birlamart",
        //     html
        //   )
        //   .then(function () {
        //     order.save(function (err) {
        //       if (err) {
        //         return apiResponse.ErrorResponse(res, err);
        //       }
        //       let orderData = {
        //         _id: order._id,
        //         createdAt: order.createdAt,
        //       };
        //       return apiResponse.successResponseWithData(
        //         res,
        //         "Order Success.",
        //         orderData
        //       );
        //     });
        //   });
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

exports.OrdersListAll = [
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
        // {
        //   $match: {
        //     user: { $eq: mongoose.Types.ObjectId(req.user._id) },
        //   },
        // },
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

exports.OrdersByDate = [
  auth,
  body("from_date", "From date is required").exists(),
  body("to_date", "To date is required").exists(),
  function (req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // Display sanitized values/errors messages.
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      } else {
        OrderModel.aggregate([
          {
            $lookup: {
              from: "users",
              localField: "user",
              foreignField: "_id",
              as: "map_user",
            },
          },
          {
            $match: {
              order_date: {
                $gte: new Date(
                  new Date(req.body.from_date).setHours(00, 00, 00)
                ),
                $lt: new Date(new Date(req.body.to_date).setHours(23, 59, 59)),
              },
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
      }
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];
