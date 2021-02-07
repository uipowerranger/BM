var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var OrderSchema = new mongoose.Schema(
  {
    user: { type: Schema.ObjectId, ref: "users", required: true },
    item_id: { type: Schema.ObjectId, ref: "products", required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    amount: { type: Number, required: true },
    status: { type: Number, required: true, default: 1 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("orders", OrderSchema);
