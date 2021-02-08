var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var OrderSchema = new mongoose.Schema(
  {
    user: { type: Schema.ObjectId, ref: "users", required: true },
    items: [
      {
        item_id: { type: Schema.ObjectId, ref: "products", required: true },
        quantity: { type: Number, required: true, default: 1 },
        price: { type: Number, required: true, default: 1 },
        amount: { type: Number, required: true, default: 1 },
      },
    ],
    order_date: { type: Date, required: true, default: new Date() },
    status: { type: Number, required: true, default: 1 },
    total_amount: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("orders", OrderSchema);
