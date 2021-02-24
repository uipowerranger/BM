const express = require("express");
const router = express.Router();
const apiResponse = require("../helpers/apiResponse");
var eway = require("../helpers/eway");

router.get("/", (req, res) => {
  eway
    .getAccessCode(req.query.AccessCode)
    .then(function (response) {
      if (response.get("Transactions[0].TransactionStatus")) {
        return apiResponse.successResponseWithData(res, "Payment Success", {
          TransactionID: response.get("Transactions[0].TransactionID"),
          TransactionStatus: response.get("Transactions[0].TransactionStatus"),
        });
      } else {
        var errorCodes = response
          .get("Transactions[0].ResponseMessage")
          .split(", ");
        return apiResponse.ErrorResponse(res, errorCodes);
      }
    })
    .catch(function (reason) {
      return apiResponse.ErrorResponse(res, "Payment Failed");
    });
});

module.exports = router;
