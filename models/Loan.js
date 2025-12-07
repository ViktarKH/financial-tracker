const mongoose = require('mongoose');

const LoanSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    paidAmount: {
        type: Number,
        default: 0
    },
    interestRate: {
        type: Number,
        required: true,
        default: 0
    },
    loanTerm: {
        type: Number,
        required: true,
        default: 1
    },
    monthlyPayment: {
        type: Number,
        required: true
    },
    remainingBalance: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Loan', LoanSchema);