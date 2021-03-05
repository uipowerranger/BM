const RedeemModel = require("../models/RedeemModel");
const { body, validationResult } = require("express-validator");
//helper file to prepare responses.
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
var mongoose = require("mongoose");
const { response } = require("express");
mongoose.set("useFindAndModify", false);

/**
 * Get Redeem by user
 */

exports.RedeemList = [
  auth,
  (req, res) => {
    RedeemModel.find({ user: req.user._id })
      .then((response) => {
        return apiResponse.successResponseWithData(
          res,
          "Redeem Fetch",
          response
        );
      })
      .catch((err) => {
        return apiResponse.ErrorResponse(res, err);
      });
  },
];

/**
 * Total redeem
 */

exports.RedeemTotal = [
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
