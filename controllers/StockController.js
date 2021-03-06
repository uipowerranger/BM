const StockMoveModel = require("../models/StockMoveModel");
const ProductModel = require("../models/ProductModel");
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
            initialStock: "$product.items_available",
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
            data["initialStock"] = response[0].initialStock;
            response.map((s) => {
              totalSold = totalSold + s.soldQuantity;
              return s;
            });
            data["totalSold"] = totalSold;
            data["currentStock"] = response[0].initialStock - totalSold;
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

exports.MovementProduct = [
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
            date: "$date",
            user: "$user",
            order_id: "$order_id",
            item_name: "$product.item_name",
            image: "$product.image",
            initialStock: "$product.items_available",
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
            return apiResponse.successResponseWithData(
              res,
              "Stock Fetch",
              response
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
      ProductModel.aggregate([
        {
          $lookup: {
            from: "stockmovements",
            localField: "_id",
            foreignField: "item_id",
            as: "stocks",
          },
        },
        {
          $match: {
            status: { $ne: 3 },
          },
        },
        {
          $project: {
            _id: 1,
            item_name: 1,
            image: 1,
            items_available: 1,
            "stocks.date": 1,
            "stocks.order_id": 1,
            "stocks.user": 1,
            "stocks.quantity": 1,
          },
        },
      ]).then((response) => {
        let data = response.map((it) => {
          let qty = 0;
          let aData = {};
          it.stocks.map((s) => {
            qty = qty + s.quantity;
          });
          aData["_id"] = it._id;
          aData["item_name"] = it.item_name;
          aData["image"] = it.image;
          aData["initialStock"] = it.items_available;
          aData["soldStock"] = qty;
          aData["currentStock"] = it.items_available - qty;
          return aData;
        });
        return apiResponse.successResponseWithData(
          res,
          "Total Stock Fetch",
          data
        );
      });
    } catch (error) {
      return apiResponse.ErrorResponse(res, error);
    }
  },
];

exports.AllProductsMovement = [
  auth,
  (req, res) => {
    try {
      ProductModel.aggregate([
        {
          $lookup: {
            from: "stockmovements",
            localField: "_id",
            foreignField: "item_id",
            as: "stocks",
          },
        },
        {
          $match: {
            status: { $ne: 3 },
          },
        },
        {
          $project: {
            _id: 1,
            item_name: 1,
            image: 1,
            items_available: 1,
            "stocks.date": 1,
            "stocks.order_id": 1,
            "stocks.user": 1,
            "stocks.quantity": 1,
          },
        },
      ]).then((response) => {
        return apiResponse.successResponseWithData(
          res,
          "Total Stock Fetch",
          response
        );
      });
    } catch (error) {
      return apiResponse.ErrorResponse(res, error);
    }
  },
];
