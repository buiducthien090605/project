const mongoose = require("mongoose")

const connectDB = async () => {
    try {
        mongoose.connect(process.env.MONGO_URI)
        console.log('InventoryDB connected')
    }
    catch (err) {
        console.error(err)
        process.exit(1)
    }
}

module.exports = connectDB