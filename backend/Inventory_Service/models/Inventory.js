const mongoose = require("mongoose")

const inventorySchema = new mongoose.Schema({
    product_id: {type: String, required: true, unique: true},
    stock: {type: Number, default: 0}
},
{
    timestamps: false
})

module.exports = mongoose.model("Inventory", inventorySchema)