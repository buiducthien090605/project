const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  items: [
    {
      product_id: String,
      quantity: Number,
      price: Number,
    }
  ],
  total_price: Number,
  status: { type: String, default: "PENDING" },
}, { timestamps: false });

module.exports = mongoose.model("Order", orderSchema);