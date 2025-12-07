const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
    description: { type: String, required: true },
    targetAmount: { type: Number, required: true },
    currentAmount: { type: Number, default: 0 }
});

const Goal = mongoose.model('Goal', goalSchema);
module.exports = Goal;