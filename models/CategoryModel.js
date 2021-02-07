var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var CategorySchema = new Schema(
  {
    category_name: { type: String, required: true },
    state_details: { type: Schema.ObjectId, ref: "states", required: true },
    post_code_details: {
      type: Schema.ObjectId,
      ref: "postcodes",
      required: true,
    },
    status: { type: Number, required: true, default: 1 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("categories", CategorySchema);
