const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    customerId: String,
    productId: String,
    orderStatus: String
});

module.exports = mongoose.model("Order", orderSchema);