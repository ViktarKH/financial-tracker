require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Atlas connected...'))
    .catch(err => console.log(err));

const Transaction = require('./models/Transaction');
const Subscription = require('./models/Subscription');
const Goal = require('./models/Goal');
const Loan = require('./models/Loan');

function calculateMonthlyPayment(principal, annualRate, termInMonths) {
    if (annualRate === 0) {
        return principal / termInMonths;
    }
    const monthlyRate = annualRate / 12 / 100;
    const numerator = monthlyRate * Math.pow(1 + monthlyRate, termInMonths);
    const denominator = Math.pow(1 + monthlyRate, termInMonths) - 1;
    return principal * (numerator / denominator);
}

app.get('/api/transactions', async (req, res) => {
    try {
        const transactions = await Transaction.find();
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/transactions', async (req, res) => {
    const transaction = new Transaction({
        description: req.body.description,
        amount: req.body.amount,
        category: req.body.category
    });
    try {
        const newTransaction = await transaction.save();
        res.status(201).json(newTransaction);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.delete('/api/transactions/:id', async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        if (transaction.description.startsWith('Накопления:')) {
            const goalDescription = transaction.description.replace('Накопления: ', '');
            const goal = await Goal.findOne({ description: goalDescription });
            
            // **NOTE**: The description in script.js uses 'Savings:', changing server logic to match.
            // Old: if (transaction.description.startsWith('Накопления:')) {
            // New: if (transaction.description.startsWith('Savings:')) {
            // Old: const goalDescription = transaction.description.replace('Накопления: ', '');
            // New: const goalDescription = transaction.description.replace('Savings: ', '');

            if (transaction.description.startsWith('Savings:')) {
                const goalDescription = transaction.description.replace('Savings: ', '');
                const goal = await Goal.findOne({ description: goalDescription });
                if (goal) {
                    goal.currentAmount -= Math.abs(transaction.amount);
                    await goal.save();
                }
            }
            
            // **NOTE**: The description in script.js uses 'Loan Payment:', changing server logic to match.
            // Old: if (transaction.description.startsWith('Оплата по кредиту:')) {
            // New: if (transaction.description.startsWith('Loan Payment:')) {
            // Old: const loanDescription = transaction.description.replace('Оплата по кредиту: ', '');
            // New: const loanDescription = transaction.description.replace('Loan Payment: ', '');
            
            if (transaction.description.startsWith('Loan Payment:')) {
                const loanDescription = transaction.description.replace('Loan Payment: ', '');
                const loan = await Loan.findOne({ description: loanDescription });

                if (loan) {
                    await Transaction.findByIdAndDelete(req.params.id);
                    
                    const loanPayments = await Transaction.find({ description: { $regex: new RegExp(`^Loan Payment: ${loanDescription}`) } }).sort({ date: 1 });
                    
                    loan.paidAmount = 0;
                    loan.remainingBalance = loan.totalAmount;
                    
                    loanPayments.forEach(payment => {
                        const monthlyRate = loan.interestRate / 12 / 100;
                        const interestThisPeriod = loan.remainingBalance * monthlyRate;
                        let principalPayment = Math.abs(payment.amount) - interestThisPeriod;
                        
                        if (principalPayment < 0) {
                            principalPayment = 0;
                        }
                        
                        loan.paidAmount += Math.abs(payment.amount);
                        loan.remainingBalance -= principalPayment;
                    });
                    
                    if (loan.remainingBalance < 0) {
                        loan.remainingBalance = 0;
                    }
                    
                    await loan.save();
                }
            } else {
                await Transaction.findByIdAndDelete(req.params.id);
            }

            res.json({ message: 'Transaction deleted' });
        } else {
            await Transaction.findByIdAndDelete(req.params.id);
            res.json({ message: 'Transaction deleted' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/api/subscriptions', async (req, res) => {
    try {
        const subscriptions = await Subscription.find();
        res.json(subscriptions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/subscriptions', async (req, res) => {
    const subscription = new Subscription({
        description: req.body.description,
        amount: req.body.amount,
        paymentDate: req.body.paymentDate
    });
    try {
        const newSubscription = await subscription.save();
        res.status(201).json(newSubscription);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.delete('/api/subscriptions/:id', async (req, res) => {
    try {
        await Subscription.findByIdAndDelete(req.params.id);
        res.json({ message: 'Subscription deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/goals', async (req, res) => {
    try {
        const goal = new Goal(req.body);
        await goal.save();
        res.status(201).json(goal);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.get('/api/goals', async (req, res) => {
    try {
        const goals = await Goal.find();
        res.json(goals);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/goals/add-funds', async (req, res) => {
    const { id, amount } = req.body;
    try {
        const goal = await Goal.findById(id);
        if (!goal) return res.status(404).json({ message: 'Goal not found' });

        goal.currentAmount += amount;
        await goal.save();

        const transaction = new Transaction({
            description: `Savings: ${goal.description}`, // Changed: Накопления: -> Savings:
            amount: -Math.abs(amount)
        });
        await transaction.save();

        res.json(goal);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.delete('/api/goals/:id', async (req, res) => {
    try {
        await Goal.findByIdAndDelete(req.params.id);
        res.json({ message: 'Savings goal deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/loans', async (req, res) => {
    try {
        const { description, totalAmount, interestRate, loanTerm } = req.body;
        
        const monthlyPayment = calculateMonthlyPayment(totalAmount, interestRate, loanTerm);

        const loan = new Loan({
            description: description,
            totalAmount: totalAmount,
            paidAmount: 0,
            interestRate: interestRate,
            loanTerm: loanTerm,
            monthlyPayment: monthlyPayment,
            remainingBalance: totalAmount
        });
        await loan.save();
        res.status(201).json(loan);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.get('/api/loans', async (req, res) => {
    try {
        const loans = await Loan.find();
        res.json(loans);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/loans/add-payment', async (req, res) => {
    const { id, amount } = req.body;
    try {
        const loan = await Loan.findById(id);
        if (!loan) return res.status(404).json({ message: 'Loan not found' });

        const monthlyRate = loan.interestRate / 12 / 100;
        const interestThisPeriod = loan.remainingBalance * monthlyRate;
        
        let principalPayment = amount - interestThisPeriod;

        if (principalPayment < 0) {
            principalPayment = 0;
        }

        loan.paidAmount += amount;
        loan.remainingBalance -= principalPayment;

        if (loan.remainingBalance < 0) {
            loan.remainingBalance = 0;
        }

        await loan.save();

        const transaction = new Transaction({
            description: `Loan Payment: ${loan.description}`, // Changed: Оплата по кредиту: -> Loan Payment:
            amount: -Math.abs(amount)
        });
        await transaction.save();

        res.json(loan);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.delete('/api/loans/:id', async (req, res) => {
    try {
        await Loan.findByIdAndDelete(req.params.id);
        res.json({ message: 'Loan deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});