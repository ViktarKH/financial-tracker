const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    amount: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: false,
        trim: true
    },
    paymentDate: {
        type: Number,
        required: true
    }
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;