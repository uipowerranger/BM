const AdminModel = require("../models/AdminModel");
const { body, validationResult } = require("express-validator");
//helper file to prepare responses.
const apiResponse = require("../helpers/apiResponse");
const utility = require("../helpers/utility");
const bcrypt = require("bcryptjs");
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
exports.register = [
  // Validate fields.
  body("first_name")
    .isLength({ min: 1 })
    .trim()
    .escape()
    .withMessage("First name must be specified.")
    .isAlphanumeric()
    .withMessage("First name has non-alphanumeric characters."),
  body("last_name")
    .isLength({ min: 1 })
    .trim()
    .escape()
    .withMessage("Last name must be specified.")
    .isAlphanumeric()
    .withMessage("Last name has non-alphanumeric characters."),
  body("email_id")
    .isLength({ min: 1 })
    .trim()
    .escape()
    .withMessage("Email must be specified.")
    .isEmail()
    .withMessage("Email must be a valid email address.")
    .custom((value) => {
      return AdminModel.findOne({ email_id: value }).then((user) => {
        if (user) {
          return Promise.reject("E-mail already in use");
        }
      });
    }),
  body("phone_number")
    .isLength({ min: 1 })
    .trim()
    .escape()
    .withMessage("Phone must be specified.")
    .custom((value) => {
      return AdminModel.findOne({ phone_number: value }).then((user) => {
        if (user) {
          return Promise.reject("Phone number already in use");
        }
      });
    }),
  body("password")
    .isLength({ min: 6 })
    .trim()
    .escape()
    .withMessage("Password must be 6 characters or greater."),
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
        //hash input password
        bcrypt.hash(req.body.password, 10, function (err, hash) {
          // generate OTP for confirmation
          let otp = utility.randomNumber(6);
          // Create User object with escaped and trimmed data
          const { password, confirmOTP, _id, ...rest } = req.body;
          var user = new AdminModel({
            password: hash,
            confirmOTP: otp,
            ...rest,
          });
          // Save user.
          user.save(function (err) {
            if (err) {
              return apiResponse.ErrorResponse(res, err);
            }
            let userData = {
              _id: user._id,
              first_name: user.first_name,
              last_name: user.last_name,
              email_id: user.email_id,
              phone_number: user.phone_number,
              designation: user.designation,
              address: user.address,
              city: user.city,
              state: user.state,
              post_code: user.post_code,
            };
            return apiResponse.successResponseWithData(
              res,
              "Registration Success.",
              userData
            );
          });
        });
      }
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * User Update
 */
exports.AdminUpdate = [
  auth,
  body("first_name", "First Name must not be empty.")
    .isLength({ min: 1 })
    .trim(),
  body("phone_number")
    .isLength({ min: 1 })
    .trim()
    .escape()
    .withMessage("Phone must be specified."),
  (req, res) => {
    try {
      const errors = validationResult(req);
      const { _id, ...rest } = req.body;
      var admin = new AdminModel({
        ...rest,
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
          AdminModel.findById(req.params.id, function (err, foundAdmin) {
            if (foundAdmin === null) {
              return apiResponse.notFoundResponse(
                res,
                "Admin not exists with this id"
              );
            } else {
              //update Category.
              AdminModel.findByIdAndUpdate(
                req.params.id,
                admin,
                {},
                function (err) {
                  if (err) {
                    return apiResponse.ErrorResponse(res, err);
                  } else {
                    let admin_data = new AdminModel(admin);
                    let userData = {
                      _id: admin_data._id,
                      first_name: admin_data.first_name,
                      last_name: admin_data.last_name,
                      email_id: admin_data.email_id,
                      role: admin_data.role,
                      assign_state: admin_data.assign_state,
                      image: admin_data.image,
                    };
                    //Prepare JWT token for authentication
                    const jwtPayload = userData;
                    const jwtData = {
                      expiresIn: process.env.JWT_TIMEOUT_DURATION,
                    };
                    const secret = process.env.JWT_SECRET;
                    //Generated JWT token with Payload and secret.
                    userData.token = jwt.sign(jwtPayload, secret, jwtData);
                    return apiResponse.successResponseWithData(
                      res,
                      "Login Success..........",
                      userData
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
 * Admin Update Password
 */

exports.AdminUpdatePassword = [
  auth,
  body("old_password", "Old password must not be empty.")
    .isLength({ min: 1 })
    .trim(),
  body("new_password")
    .isLength({ min: 1 })
    .trim()
    .escape()
    .withMessage("New password must be specified."),
  (req, res) => {
    try {
      const errors = validationResult(req);
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
          AdminModel.findById(req.params.id, function (err, foundAdmin) {
            if (foundAdmin === null) {
              return apiResponse.notFoundResponse(
                res,
                "Admin not exists with this id"
              );
            } else {
              //update admin.
              bcrypt.compare(
                req.body.old_password,
                foundAdmin.password,
                function (err, same) {
                  if (same) {
                    bcrypt.hash(
                      req.body.new_password,
                      10,
                      function (err, hash) {
                        AdminModel.findByIdAndUpdate(
                          req.params.id,
                          { password: hash },
                          {},
                          function (err) {
                            if (err) {
                              return apiResponse.ErrorResponse(res, err);
                            } else {
                              return apiResponse.successResponse(
                                res,
                                "Admin Password update Success."
                              );
                            }
                          }
                        );
                      }
                    );
                  } else {
                    return apiResponse.ErrorResponse(
                      res,
                      "Old Password is invalid."
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
 * User login.
 *
 * @param {string}      email_id
 * @param {string}      password
 *
 * @returns {Object}
 */
exports.login = [
  body("email_id")
    .isLength({ min: 1 })
    .trim()
    .escape()
    .withMessage("Email must be specified.")
    .isEmail()
    .withMessage("Email must be a valid email address."),
  body("password")
    .isLength({ min: 1 })
    .trim()
    .escape()
    .withMessage("Password must be specified."),

  (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      } else {
        AdminModel.findOne({ email_id: req.body.email_id }).then((user) => {
          if (user) {
            //Compare given password with db's hash.
            bcrypt.compare(
              req.body.password,
              user.password,
              function (err, same) {
                if (same) {
                  //Check account confirmation.
                  if (true) {
                    // Check User's account active or not.
                    if (user.status) {
                      let otp = utility.randomNumber(6);
                      // Html email body
                      let html =
                        "<p>Please Login your Account.</p><p>OTP: " +
                        otp +
                        "</p>";
                      // Send confirmation email
                      mailer
                        .send(
                          constants.confirmEmails.from,
                          req.body.email_id,
                          "Login OTP ",
                          html
                        )
                        .then(function () {
                          AdminModel.findOneAndUpdate(
                            { email_id: req.body.email_id },
                            {
                              isConfirmed: 1,
                              confirmOTP: otp,
                            }
                          ).catch((err) => {
                            return apiResponse.ErrorResponse(res, err);
                          });
                          let userData = {
                            _id: user._id,
                            first_name: user.first_name,
                            last_name: user.last_name,
                            email_id: user.email_id,
                            role: user.role,
                            assign_state: user.assign_state,
                            image: user.image,
                          };
                          //Prepare JWT token for authentication
                          const jwtPayload = userData;
                          const jwtData = {
                            expiresIn: process.env.JWT_TIMEOUT_DURATION,
                          };
                          const secret = process.env.JWT_SECRET;
                          //Generated JWT token with Payload and secret.
                          userData.token = jwt.sign(
                            jwtPayload,
                            secret,
                            jwtData
                          );
                          return apiResponse.successResponseWithData(
                            res,
                            "Login Success.",
                            userData
                          );
                        });
                    } else {
                      return apiResponse.unauthorizedResponse(
                        res,
                        "Account is not active. Please contact admin."
                      );
                    }
                  }
                } else {
                  return apiResponse.unauthorizedResponse(
                    res,
                    "Email or Password wrong."
                  );
                }
              }
            );
          } else {
            return apiResponse.unauthorizedResponse(
              res,
              "Email or Password wrong."
            );
          }
        });
      }
    } catch (err) {
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * Verify Confirm otp.
 *
 * @param {string}      email_id
 * @param {string}      otp
 *
 * @returns {Object}
 */
exports.verifyConfirm = [
  body("email_id")
    .isLength({ min: 1 })
    .trim()
    .escape()
    .withMessage("Email must be specified.")
    .isEmail()
    .withMessage("Email must be a valid email address."),
  body("otp")
    .isLength({ min: 1 })
    .trim()
    .escape()
    .withMessage("OTP must be specified."),

  (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      } else {
        var query = { email_id: req.body.email_id };
        AdminModel.findOne(query).then((user) => {
          if (user) {
            //Check already confirm or not.
            if (true) {
              //Check account confirmation.
              if (user.confirmOTP == req.body.otp) {
                //Update user as confirmed
                AdminModel.findOneAndUpdate(query, {
                  isConfirmed: 1,
                  confirmOTP: null,
                }).catch((err) => {
                  return apiResponse.ErrorResponse(res, err);
                });
                let userData = {
                  _id: user._id,
                  first_name: user.first_name,
                  last_name: user.last_name,
                  email_id: user.email_id,
                  role: user.role,
                  assign_state: user.assign_state,
                  image: user.image,
                };
                //Prepare JWT token for authentication
                const jwtPayload = userData;
                const jwtData = {
                  expiresIn: process.env.JWT_TIMEOUT_DURATION,
                };
                const secret = process.env.JWT_SECRET;
                //Generated JWT token with Payload and secret.
                userData.token = jwt.sign(jwtPayload, secret, jwtData);
                return apiResponse.successResponseWithData(
                  res,
                  "Login Success.",
                  userData
                );
              } else {
                return apiResponse.unauthorizedResponse(
                  res,
                  "Otp does not match"
                );
              }
            } else {
              return apiResponse.unauthorizedResponse(
                res,
                "Account already confirmed."
              );
            }
          } else {
            return apiResponse.unauthorizedResponse(
              res,
              "Specified email not found."
            );
          }
        });
      }
    } catch (err) {
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * Resend Confirm otp.
 *
 * @param {string}      email_id
 *
 * @returns {Object}
 */
exports.resendConfirmOtp = [
  body("email_id")
    .isLength({ min: 1 })
    .trim()
    .escape()
    .withMessage("Email must be specified.")
    .isEmail()
    .withMessage("Email must be a valid email address."),

  (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      } else {
        var query = { email_id: req.body.email_id };
        AdminModel.findOne(query).then((user) => {
          if (user) {
            //Check already confirm or not.
            if (true) {
              // Generate otp
              let otp = utility.randomNumber(6);
              // Html email body
              let html =
                "<p>Please Login your Account.</p><p>OTP: " + otp + "</p>";
              // Send confirmation email
              mailer
                .send(
                  constants.confirmEmails.from,
                  req.body.email_id,
                  "Login OTP",
                  html
                )
                .then(function () {
                  user.isConfirmed = 0;
                  user.confirmOTP = otp;
                  // Save user.
                  user.save(function (err) {
                    if (err) {
                      return apiResponse.ErrorResponse(res, err);
                    }
                    return apiResponse.successResponse(
                      res,
                      "Confirm otp sent."
                    );
                  });
                });
            } else {
              return apiResponse.unauthorizedResponse(
                res,
                "Account already confirmed."
              );
            }
          } else {
            return apiResponse.unauthorizedResponse(
              res,
              "Specified email not found."
            );
          }
        });
      }
    } catch (err) {
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * Get Admin By id
 */

exports.getAdminById = [
  auth,
  function (req, res) {
    try {
      AdminModel.aggregate([
        {
          $lookup: {
            from: "states",
            localField: "assign_state",
            foreignField: "_id",
            as: "map_state",
          },
        },
        // {
        //   $unwind: "$map_state",
        // },
        {
          $match: {
            _id: mongoose.Types.ObjectId(req.params.id),
          },
        },
        {
          $project: {
            __v: 0,
          },
        },
      ]).then((admindata) => {
        if (admindata) {
          return apiResponse.successResponseWithData(
            res,
            "Operation success",
            admindata
          );
        } else {
          return apiResponse.successResponseWithData(
            res,
            "Operation success",
            {}
          );
        }
      });
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * Get Admins
 */
exports.AdminsList = [
  auth,
  function (req, res) {
    try {
      AdminModel.aggregate([
        {
          $lookup: {
            from: "states",
            localField: "assign_state",
            foreignField: "_id",
            as: "map_state",
          },
        },
        {
          $project: {
            __v: 0,
            // _idNe: { $ne: ["$_id", mongoose.Types.ObjectId(req.user._id)] },
          },
        },
      ]).then((admindata) => {
        if (admindata) {
          let newData = admindata.filter((f) => {
            return String(f._id) !== String(req.user._id);
          });
          if (req.user.role === "admin") {
            return apiResponse.successResponseWithData(
              res,
              "Operation success",
              newData
            );
          } else {
            return apiResponse.successResponseWithData(
              res,
              "Operation success",
              []
            );
          }
        } else {
          return apiResponse.successResponseWithData(
            res,
            "Operation success",
            {}
          );
        }
      });
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * Image uploads
 */
exports.fileUpload = [
  auth,
  async function (req, res) {
    try {
      const data = req.body.data;
      let url = await utility.saveImage(data);
      return apiResponse.successResponseWithData(res, "File uploaded", url);
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

exports.resetMail = [
  body("email_id")
    .isLength({ min: 1 })
    .trim()
    .escape()
    .withMessage("Email must be specified.")
    .isEmail()
    .withMessage("Email must be a valid email address."),
  function (req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      } else {
        AdminModel.findOne({ email_id: req.body.email_id }).then((data) => {
          if (data) {
            let otp = utility.randomNumber(6);
            let url =
              process.env.PAYMENT_URL +
              `/#/admin/reset-pwd?email=${data.email_id}&otp=${otp}`;
            // Html email body
            let html = `<p>Reset Password.</p><p>Your OTP to reset password: ${otp}</p>`;
            // Send confirmation email
            mailer
              .send(
                constants.confirmEmails.from,
                req.body.email_id,
                "Reset Password ",
                html
              )
              .then(function () {
                AdminModel.findOneAndUpdate(
                  { email_id: req.body.email_id },
                  {
                    isConfirmed: 1,
                    confirmOTP: otp,
                  }
                ).catch((err) => {
                  return apiResponse.ErrorResponse(res, err);
                });
              });
            return apiResponse.successResponse(res, "Mail sent Success.");
          } else {
            return apiResponse.ErrorResponse(res, "Email not found");
          }
        });
      }
    } catch (error) {
      return apiResponse.ErrorResponse(res, error);
    }
  },
];

exports.resetPassword = [
  body("email_id")
    .isLength({ min: 1 })
    .trim()
    .escape()
    .withMessage("Email must be specified.")
    .isEmail()
    .withMessage("Email must be a valid email address."),
  body("password")
    .isLength({ min: 6 })
    .trim()
    .escape()
    .withMessage("Password must be 6 characters or greater."),
  body("otp")
    .isLength({ min: 6 })
    .trim()
    .escape()
    .withMessage("OTP must be 6 characters")
    .isNumeric()
    .withMessage("OTP must be numeric"),
  function (req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      } else {
        AdminModel.findOne({
          email_id: req.body.email_id,
          confirmOTP: req.body.otp,
        }).then((data) => {
          if (data) {
            //hash input password
            bcrypt.hash(req.body.password, 10, function (err, hash) {
              // generate OTP for confirmation
              let otp = utility.randomNumber(6);
              // Create User object with escaped and trimmed data
              const { password, email_id } = req.body;
              // Update user.
              AdminModel.findByIdAndUpdate(
                { _id: data._id },
                { password: hash },
                {},
                function (err) {
                  if (err) {
                    return apiResponse.ErrorResponse(res, err);
                  }
                  return apiResponse.successResponse(
                    res,
                    "Password updated Successfully."
                  );
                }
              );
            });
          } else {
            return apiResponse.ErrorResponse(res, "Email link has expired");
          }
        });
      }
    } catch (error) {
      return apiResponse.ErrorResponse(res, error);
    }
  },
];
