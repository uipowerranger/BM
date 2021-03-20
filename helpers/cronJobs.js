var CronJob = require("cron").CronJob;
var AdminModel = require("../models/AdminModel");
var OrderModel = require("../models/OrderModel");
var mongoose = require("mongoose");

exports.start = async () => {
  console.log("Cron job init start");

  AdminModel.find({ status: 1 })
    .then((data) => {
      if (data.length > 0) {
        let admins = [];
        let stateAdmins = [];
        data.map((a) => {
          if (a.role === "admin") {
            admins.push(a.email_id);
          } else if (a.role === "state_admin") {
            let isExist = stateAdmins.findIndex((e) => {
              // console.log(
              //   mongoose.Types.ObjectId(e.state_id) ===
              //     mongoose.Types.ObjectId(a.assign_state)
              // );
              return true;
            });
            // console.log(isExist, "isExist");
            stateAdmins.push({ state_id: a.assign_state, email: [a.email_id] });
          }
        });
        // console.log(admins, stateAdmins);
        if (stateAdmins.length > 0) {
          let stateData = stateAdmins.map((s) => {
            // console.log(s.state_id);
          });
        }
      }
    })
    .catch((error) => console.log(error));

  const jobFasting = new CronJob(
    "00 00 07 * * *",
    function () {
      const d = new Date();
      console.log("Morning:", d);
    },
    null,
    true,
    "Asia/Kolkata"
  );
  jobFasting.start();
};
