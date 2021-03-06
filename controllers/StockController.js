const StockMoveModel = require("../models/StockMoveModel");
const { body, validationResult } = require("express-validator");
//helper file to prepare responses.
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);

/**
 * Get stock by item
 */

exports.Product = [
  auth,
  (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return apiResponse.validationErrorWithData(
          res,
          "Invalid Id",
          "Invalid product Id"
        );
      }
      StockMoveModel.aggregate([
        {
          $lookup: {
            from: "products",
            localField: "item_id",
            foreignField: "_id",
            as: "product",
          },
        },
        {
          $unwind: "$product",
        },
        {
          $match: {
            item_id: mongoose.Types.ObjectId(req.params.id),
          },
        },
        {
          $project: {
            _id: 0,
            item_id: "$item_id",
            item_name: "$product.item_name",
            image: "$product.image",
            initialQuantity: "$product.items_available",
            soldQuantity: {
              $cond: {
                if: {
                  $eq: ["$item_id", mongoose.Types.ObjectId(req.params.id)],
                },
                then: "$quantity",
                else: 0,
              },
            },
          },
        },
      ])
        .then((response) => {
          if (response.length > 0) {
            let totalSold = 0;
            let data = {};
            data["item_id"] = response[0].item_id;
            data["item_name"] = response[0].item_name;
            data["image"] = response[0].image;
            data["initialQuantity"] = response[0].initialQuantity;
            response.map((s) => {
              totalSold = totalSold + s.soldQuantity;
              return s;
            });
            data["totalSold"] = totalSold;
            data["currentStock"] = response[0].initialQuantity - totalSold;
            return apiResponse.successResponseWithData(
              res,
              "Stock Fetch",
              data
            );
          } else {
            return apiResponse.successResponse(res, "No Stock found");
          }
        })
        .catch((err) => {
          return apiResponse.ErrorResponse(res, err);
        });
    } catch (err) {
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * Total stocks
 */

exports.AllProducts = [
  auth,
  (req, res) => {
    try {
      RedeemModel.aggregate([
        {
          $project: {
            _id: 0,
            user: req.user._id,
            redeem: {
              $cond: {
                if: { $eq: ["$user", mongoose.Types.ObjectId(req.user._id)] },
                then: "$redeem_points",
                else: 0,
              },
            },
          },
        },
        {
          $group: {
            _id: "$user",
            totalRedeem: { $sum: "$redeem" },
          },
        },
      ]).then((response) => {
        return apiResponse.successResponseWithData(
          res,
          "Total Redeem Fetch",
          response
        );
      });
    } catch (error) {
      return apiResponse.ErrorResponse(res, error);
    }
  },
];
