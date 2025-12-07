# Financial Tracker (MyFinances)

This project is a simple personal finance web tracker built using **Node.js/Express** for the backend, **MongoDB** for the database, and plain **HTML/CSS/JavaScript** for the frontend. It allows users to track income, expenses (with categories), manage subscriptions, set savings goals, and track loans/debts.

## Features

* **Real-time Balance:** Displays current balance and the total amount of monthly subscriptions.
* **Transaction Tracking:** Add income and expenses with descriptions and amounts.
* **Subscriptions:** Track mandatory monthly payments.
* **Savings Goals:** Set a target amount and monitor your progress towards the goal.
* **Loans:** Track loans, including monthly payment calculation, amount paid, and remaining balance.
* **Visualization:** A doughnut chart to show the distribution of expenses by category.
* **History:** A list of all transactions, goals, and loans.

## How to Run the Project

To run this project, you will need **Node.js** and an account with **MongoDB Atlas** (for the cloud database).

### 1. Prerequisites

* **Node.js** (LTS version recommended)
* **MongoDB Atlas** account and connection URI string.
* **Git** (to clone the repository).

### 2. Installation

Clone the repository (if you haven't already):

```bash
git clone [YOUR_REPO_URL]
cd financial-tracker
```
Install all necessary dependencies (listed in package.json):

```bash
npm install
```
### 3. Environment Variables Setup (.env)
Create a file named .env in the root directory of your project. In this file, you must specify your MongoDB connection string.

ATTENTION: Remember to replace YOUR_MONGO_DB_URI with the actual connection string obtained from MongoDB Atlas.
```
# MongoDB Atlas Connection String
MONGO_URI="YOUR_MONGO_DB_URI"
# Example: MONGO_URI="mongodb+srv://your_user:your_password@cluster0.abcde.mongodb.net/MyFinancesDB?retryWrites=true&w=majority"
```
### 4. Starting the Server
Start the Node.js server (server.js file):

```bash
node server.js
```
The server should start on port 3000. You will see the following output in the console:

```bash
MongoDB Atlas connected...
Server running on port 3000
```
### 5. Accessing the Application
Open your web browser and navigate to:

```bash
http://localhost:3000
```
You can now start using the application and adding your financial operations!
