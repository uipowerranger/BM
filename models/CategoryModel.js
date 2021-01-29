var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var CategorySchema = new Schema(
  {
    category_name: { type: String, required: true },
    status: { type: Boolean, required: true, default: 1 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("categories", CategorySchema);
