const rapid = require("eway-rapid");

var key =
    "60CF3Ce97nRS1Z1Wp5m9kMmzHHEh8Rkuj31QCtVxjPWGYA9FymyqsK0Enm1P6mHJf0THbR",
  password = "API-P4ss",
  endpoint = "sandbox";

var client = rapid.createClient(key, password, endpoint);

exports.getAccessCode = (AccessCode) => {
  return client.queryTransaction(AccessCode);
};

exports.payment = (amount) => {
  //   client
  //     .createTransaction(rapid.Enum.Method.DIRECT, {
  //       Customer: {
  //         CardDetails: {
  //           Name: "John Smith",
  //           Number: "4444333322221111",
  //           ExpiryMonth: "12",
  //           ExpiryYear: "25",
  //           CVN: "123",
  //         },
  //       },
  //       Payment: {
  //         TotalAmount: 1000,
  //       },
  //       TransactionType: "Purchase",
  //     })
  //     .then(function (response) {
  //       console.log(response);
  //       if (response.get("TransactionStatus")) {
  //         console.log("Payment successful! ID: " + response.get("TransactionID"));
  //       }
  //     });

  return client.createTransaction(rapid.Enum.Method.RESPONSIVE_SHARED, {
    Payment: {
      TotalAmount: amount,
    },
    // Change these to your server
    RedirectUrl: process.env.PAYMENT_URL + "/payment",
    CancelUrl: process.env.PAYMENT_URL + "/payment",
    TransactionType: "Purchase",
  });
};
