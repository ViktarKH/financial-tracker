document.addEventListener('DOMContentLoaded', () => {
    const subscriptionsTotalEl = document.getElementById('subscriptions-total');
    const balanceEl = document.getElementById('balance');
    const formContainer = document.getElementById('form-container');
    const sidebarBtns = document.querySelectorAll('.function-btn');
    const transactionList = document.getElementById('transaction-list');
    const listTitle = document.getElementById('list-title');
    const expensesChartContainer = document.getElementById('expenses-chart-container');
    const dynamicChartContainer = document.getElementById('dynamic-chart-container');
    const expensesChartCtx = document.getElementById('expenses-chart').getContext('2d');
    const dynamicChartCtx = document.getElementById('dynamic-chart').getContext('2d');
    
    let expensesChart, dynamicChart;

    const incomeFormHTML = `
        <h4>Add Income</h4>
        <form id="income-form">
            <input type="text" id="income-description" placeholder="Description" required>
            <input type="number" id="income-amount" placeholder="Amount" required>
            <button type="submit">Add</button>
        </form>
    `;

    const expenseFormHTML = `
        <h4>Add Expense</h4>
        <form id="expense-form">
            <input type="text" id="expense-description" placeholder="Description" required>
            <input type="number" id="expense-amount" placeholder="Amount" required>
            <input type="text" id="expense-category" placeholder="Category">
            <button type="submit">Add</button>
        </form>
    `;

    const subscriptionFormHTML = `
        <h4>Add Subscription</h4>
        <form id="subscription-form">
            <input type="text" id="sub-description" placeholder="Description" required>
            <input type="number" id="sub-amount" placeholder="Amount" required>
            <input type="number" id="sub-payment-date" placeholder="Day of the month (1-31)" required min="1" max="31">
            <button type="submit">Add</button>
        </form>
    `;

    const savingsFormHTML = `
        <h4>Create Savings Goal</h4>
        <form id="savings-form">
            <input type="text" id="goal-description-input" placeholder="Goal Name" required>
            <input type="number" id="target-amount-input" placeholder="Target Amount" required>
            <button type="submit">Create Goal</button>
        </form>
    `;

    const addFundsFormHTML = (goalId, goalDescription) => `
        <h4>Add Funds to: ${goalDescription}</h4>
        <form id="add-funds-form" data-goal-id="${goalId}">
            <input type="number" id="funds-amount" placeholder="Amount" required>
            <button type="submit">Save</button>
        </form>
    `;

    const loanFormHTML = `
        <h4>Add Loan</h4>
        <form id="loan-form">
            <input type="text" id="loan-description-input" placeholder="Loan Name" required>
            <input type="number" id="loan-total-amount-input" placeholder="Total Amount" required>
            <input type="number" id="loan-interest-rate-input" placeholder="Interest Rate, % per year" required>
            <input type="number" id="loan-term-input" placeholder="Term, months" required>
            <button type="submit">Add Loan</button>
        </form>
    `;

    const addLoanPaymentFormHTML = (loanId, loanDescription) => `
        <h4>Make Loan Payment: ${loanDescription}</h4>
        <form id="add-loan-payment-form" data-loan-id="${loanId}">
            <input type="number" id="loan-payment-amount" placeholder="Amount" required>
            <button type="submit">Make Payment</button>
        </form>
    `;

    const chartCategoryColors = [
        '#e74c3c', '#9b59b6', '#3498db', '#f1c40f', '#1abc9c', '#2ecc71', '#c0392b'
    ];

    function renderForm(target, data = null) {
        switch (target) {
            case 'add-income':
                formContainer.innerHTML = incomeFormHTML;
                setupIncomeForm();
                break;
            case 'add-expense':
                formContainer.innerHTML = expenseFormHTML;
                setupExpenseForm();
                break;
            case 'add-subscription':
                formContainer.innerHTML = subscriptionFormHTML;
                setupSubscriptionForm();
                break;
            case 'create-savings':
                formContainer.innerHTML = savingsFormHTML;
                setupSavingsForm();
                break;
            case 'add-funds':
                formContainer.innerHTML = addFundsFormHTML(data.id, data.description);
                setupAddFundsForm();
                break;
            case 'create-loan':
                formContainer.innerHTML = loanFormHTML;
                setupLoanForm();
                break;
            case 'add-loan-payment':
                formContainer.innerHTML = addLoanPaymentFormHTML(data.id, data.description);
                setupAddLoanPaymentForm();
                break;
        }
    }

    function setupIncomeForm() {
        const incomeForm = document.getElementById('income-form');
        incomeForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const description = document.getElementById('income-description').value;
            const amount = parseFloat(document.getElementById('income-amount').value);
            const newTransaction = { description, amount };
            try {
                await fetch('http://localhost:3000/api/transactions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newTransaction)
                });
                incomeForm.reset();
                fetchDataAndRender('transactions');
            } catch (err) {
                console.error('Error adding income:', err);
            }
        });
    }

    function setupExpenseForm() {
        const expenseForm = document.getElementById('expense-form');
        expenseForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const description = document.getElementById('expense-description').value;
            const amount = -Math.abs(parseFloat(document.getElementById('expense-amount').value));
            const category = document.getElementById('expense-category').value;
            const newTransaction = { description, amount, category };
            try {
                await fetch('http://localhost:3000/api/transactions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newTransaction)
                });
                expenseForm.reset();
                fetchDataAndRender('transactions');
            } catch (err) {
                console.error('Error adding expense:', err);
            }
        });
    }

    function setupSubscriptionForm() {
        const subscriptionForm = document.getElementById('subscription-form');
        subscriptionForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const description = document.getElementById('sub-description').value;
            const amount = -Math.abs(parseFloat(document.getElementById('sub-amount').value));
            const paymentDate = parseInt(document.getElementById('sub-payment-date').value);
            const newSubscription = { description, amount, paymentDate };
            try {
                await fetch('http://localhost:3000/api/subscriptions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newSubscription)
                });
                subscriptionForm.reset();
                fetchDataAndRender('subscriptions');
            } catch (err) {
                console.error('Error adding subscription:', err);
            }
        });
    }
    
    function setupSavingsForm() {
        const savingsForm = document.getElementById('savings-form');
        savingsForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const description = document.getElementById('goal-description-input').value;
            const targetAmount = parseFloat(document.getElementById('target-amount-input').value);
            try {
                const response = await fetch('http://localhost:3000/api/goals', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ description, targetAmount })
                });
                const newGoal = await response.json();
                savingsForm.reset();
                fetchDataAndRender('savings');
            } catch (err) {
                console.error('Error creating goal:', err);
            }
        });
    }
    
    function setupAddFundsForm() {
        const addFundsForm = document.getElementById('add-funds-form');
        addFundsForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const goalId = addFundsForm.dataset.goalId;
            const amount = parseFloat(document.getElementById('funds-amount').value);
            try {
                const response = await fetch('http://localhost:3000/api/goals/add-funds', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: goalId, amount })
                });
                const updatedGoal = await response.json();
                addFundsForm.reset();
                fetchDataAndRender('savings', updatedGoal._id);
            } catch (err) {
                console.error('Error adding funds:', err);
            }
        });
    }

    function setupLoanForm() {
        const loanForm = document.getElementById('loan-form');
        loanForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const description = document.getElementById('loan-description-input').value;
            const totalAmount = parseFloat(document.getElementById('loan-total-amount-input').value);
            const interestRate = parseFloat(document.getElementById('loan-interest-rate-input').value);
            const loanTerm = parseInt(document.getElementById('loan-term-input').value);
            
            const newLoan = { description, totalAmount, interestRate, loanTerm };
            
            try {
                const response = await fetch('http://localhost:3000/api/loans', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newLoan)
                });
                const newLoanData = await response.json();
                loanForm.reset(); 
                fetchDataAndRender('loans');
            } catch (err) {
                console.error('Error adding loan:', err);
            }
        });
    }
    
    function setupAddLoanPaymentForm() {
        const addLoanPaymentForm = document.getElementById('add-loan-payment-form');
        addLoanPaymentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const loanId = addLoanPaymentForm.dataset.loanId;
            const amount = parseFloat(document.getElementById('loan-payment-amount').value);
            try {
                const response = await fetch('http://localhost:3000/api/loans/add-payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: loanId, amount })
                });
                const updatedLoan = await response.json();
                addLoanPaymentForm.reset();
                fetchDataAndRender('loans', updatedLoan._id);
            } catch (err) {
                console.error('Error making payment:', err);
            }
        });
    }

    function renderHistory(data, mode) {
        transactionList.innerHTML = '';
        data.forEach(item => {
            const li = document.createElement('li');
            li.dataset.id = item._id;

            if (mode === 'subscriptions') {
                li.innerHTML = `<span>${item.description}</span><span>${item.amount.toFixed(2)}</span><button class="delete-btn" data-type="subscription">x</button>`;
            } else if (mode === 'savings') {
                li.innerHTML = `<span>${item.description}</span><span>${item.currentAmount.toFixed(2)} / ${item.targetAmount.toFixed(2)}</span><div class="buttons"><button class="add-funds-btn" data-id="${item._id}" data-description="${item.description}" data-type="${mode}">+</button><button class="delete-btn" data-type="goal">x</button></div>`;
            } else if (mode === 'loans') {
                li.innerHTML = `<span>${item.description}<br><small>Payment: ${item.monthlyPayment.toFixed(2)} / mo.</small><br><small>Remaining: ${item.remainingBalance.toFixed(2)}</small></span><span>${item.paidAmount.toFixed(2)} / ${(item.monthlyPayment * item.loanTerm).toFixed(2)}</span><div class="buttons"><button class="add-funds-btn" data-id="${item._id}" data-description="${item.description}" data-type="${mode}">+</button><button class="delete-btn" data-type="loan">x</button></div>`;
            } else { 
                li.classList.add(item.amount < 0 ? 'minus' : 'plus');
                li.innerHTML = `<span>${item.description}</span><span>${item.amount.toFixed(2)}</span><button class="delete-btn" data-type="transaction">x</button>`;
            }
            transactionList.appendChild(li);
        });
    }
    
    function updateTotals(transactions) {
        const total = transactions.reduce((acc, item) => acc + item.amount, 0);
        balanceEl.innerText = total.toFixed(2);
    }

    function getExpensesByCategory(transactions, subscriptions) {
        const expenses = transactions.filter(t => t.amount < 0);
        const combinedData = [...expenses, ...subscriptions];
        const categoryMap = {};
        combinedData.forEach(item => {
            let category;
            if (item.description.startsWith('Savings:')) {
                category = 'Savings';
            } else if (item.description.startsWith('Loan Payment:')) {
                category = 'Loans';
            } else if (item.category && item.category.trim() !== '') {
                category = item.category;
            } else if (item.paymentDate) {
                category = 'Subscriptions';
            } else {
                category = 'Other';
            }

            if (!categoryMap[category]) {
                categoryMap[category] = 0;
            }
            categoryMap[category] += Math.abs(item.amount);
        });
        return categoryMap;
    }

    function renderExpensesChart(data) {
        expensesChartContainer.style.display = 'flex';
        dynamicChartContainer.style.display = 'none';

        const labels = Object.keys(data);
        const amounts = Object.values(data);
        const backgroundColors = labels.map((_, index) => chartCategoryColors[index % chartCategoryColors.length]);

        const dataConfig = {
            labels: labels,
            datasets: [{
                data: amounts,
                backgroundColor: backgroundColors,
                borderColor: '#34495e',
                borderWidth: 2
            }]
        };

        if (expensesChart) {
            expensesChart.destroy();
        }

        expensesChart = new Chart(expensesChartCtx, {
            type: 'doughnut',
            data: dataConfig,
            options: { responsive: true, cutout: '70%', borderRadius: 5, plugins: { legend: { position: 'bottom', labels: { color: 'white' } } } }
        });
    }

    function renderDynamicChart(data, title, type = 'savings') {
        expensesChartContainer.style.display = 'none';
        dynamicChartContainer.style.display = 'flex';
        document.getElementById('dynamic-chart-title').innerText = title;

        let totalAmount, completedAmount;
        if (type === 'savings') {
            totalAmount = data.targetAmount;
            completedAmount = data.currentAmount;
        } else { 
            const totalRepayment = data.monthlyPayment * data.loanTerm;
            totalAmount = totalRepayment;
            completedAmount = data.paidAmount;
        }
        
        const remainingAmount = totalAmount - completedAmount;
        const labels = [type === 'savings' ? 'Saved' : 'Paid', 'Remaining'];
        const amounts = [completedAmount, remainingAmount];
        const colors = [type === 'savings' ? '#9b59b6' : '#e74c3c', '#555'];

        const dataConfig = {
            labels: labels,
            datasets: [{
                data: amounts,
                backgroundColor: colors,
                borderColor: '#34495e',
                borderWidth: 2
            }]
        };
        
        if (dynamicChart) {
            dynamicChart.destroy();
        }

        dynamicChart = new Chart(dynamicChartCtx, {
            type: 'doughnut',
            data: dataConfig,
            options: { responsive: true, cutout: '70%', borderRadius: 5, plugins: { legend: { position: 'bottom', labels: { color: 'white' } } } }
        });
    } 

    async function fetchDataAndRender(mode, targetId = null) {
        try {
            if (mode === 'transactions' || mode === 'subscriptions') {
                const transactionsRes = await fetch('http://localhost:3000/api/transactions');
                const subscriptionsRes = await fetch('http://localhost:3000/api/subscriptions');
                
                const transactions = await transactionsRes.json();
                const subscriptions = await subscriptionsRes.json();
                
                updateTotals(transactions);
                fetchSubscriptionsTotal();
                
                const combinedExpenses = getExpensesByCategory(transactions, subscriptions);
                renderExpensesChart(combinedExpenses);
                
                if (mode === 'transactions') {
                    renderHistory(transactions, 'transactions');
                    listTitle.innerText = 'Transaction History';
                } else { 
                    renderHistory(subscriptions, 'subscriptions');
                    listTitle.innerText = 'Subscriptions List';
                }
            } else if (mode === 'savings') {
                const res = await fetch('http://localhost:3000/api/goals');
                const goals = await res.json();
                
                if (goals.length > 0 && targetId) {
                    let targetGoal = goals.find(g => g._id === targetId);
                    if (targetGoal) {
                        renderDynamicChart(targetGoal, 'Savings Progress', 'savings');
                    }
                } else {
                    expensesChartContainer.style.display = 'none';
                    dynamicChartContainer.style.display = 'none';
                }
                renderHistory(goals, 'savings');
                listTitle.innerText = 'Savings Goals';
            } else if (mode === 'loans') {
                const res = await fetch('http://localhost:3000/api/loans');
                const loans = await res.json();
                
                if (loans.length > 0 && targetId) {
                    let targetLoan = loans.find(l => l._id === targetId);
                    if (targetLoan) {
                       renderDynamicChart(targetLoan, 'Loan Progress', 'loans');
                    }
                } else {
                    expensesChartContainer.style.display = 'none';
                    dynamicChartContainer.style.display = 'none';
                }
                
                renderHistory(loans, 'loans');
                listTitle.innerText = 'Loans';
            }
        } catch (err) {
            console.error('Error fetching data:', err);
        }
    }
    
    sidebarBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            sidebarBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            const target = e.target.dataset.target;
            
            if (target === 'add-income' || target === 'add-expense') {
                renderForm(target);
                fetchDataAndRender('transactions');
            } else if (target === 'add-subscription') {
                renderForm(target);
                fetchDataAndRender('subscriptions');
            } else if (target === 'add-savings') {
                renderForm('create-savings');
                fetchDataAndRender('savings');
            } else if (target === 'add-loan') {
                renderForm('create-loan');
                fetchDataAndRender('loans');
            }
        });
    });

    transactionList.addEventListener('click', async (e) => {
        const clickedElement = e.target;
        const parentLi = clickedElement.closest('li');
        const id = parentLi ? parentLi.dataset.id : null;
        const type = clickedElement.dataset.type;

        if (clickedElement.classList.contains('delete-btn')) {
            try {
                if (type === 'goal') {
                    await fetch(`http://localhost:3000/api/goals/${id}`, { method: 'DELETE' });
                    fetchDataAndRender('savings');
                } else if (type === 'transaction') {
                    await fetch(`http://localhost:3000/api/transactions/${id}`, { method: 'DELETE' });
                    fetchDataAndRender('transactions');
                } else if (type === 'subscription') {
                    await fetch(`http://localhost:3000/api/subscriptions/${id}`, { method: 'DELETE' });
                    fetchDataAndRender('subscriptions');
                } else if (type === 'loan') {
                    await fetch(`http://localhost:3000/api/loans/${id}`, { method: 'DELETE' });
                    fetchDataAndRender('loans');
                }
            } catch (err) {
                console.error('Error deleting:', err);
            }
        } else if (clickedElement.classList.contains('add-funds-btn')) {
            const id = clickedElement.dataset.id;
            const description = clickedElement.dataset.description;
            const itemType = clickedElement.dataset.type;
            if (itemType === 'savings') {
                renderForm('add-funds', { id, description });
                fetchDataAndRender('savings', id);
            } else if (itemType === 'loans') {
                renderForm('add-loan-payment', { id, description });
                fetchDataAndRender('loans', id);
            }
        }
    });

    async function fetchSubscriptionsTotal() {
        try {
            const res = await fetch('http://localhost:3000/api/subscriptions');
            const subscriptions = await res.json();
            const total = subscriptions.reduce((acc, sub) => acc + Math.abs(sub.amount), 0);
            subscriptionsTotalEl.innerText = `(-${total.toFixed(2)})`;
        } catch (err) {
            console.error('Error fetching subscriptions:', err);
        }
    }

    renderForm('add-income');
    fetchDataAndRender('transactions');
});