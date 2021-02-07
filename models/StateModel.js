var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var StateSchema = new Schema(
  {
    state_name: { type: String, required: true },
    status: { type: Number, required: true, default: 1 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("states", StateSchema);
