# Personal Budget API

## Overview

The **Personal Budget API** is a RESTful API built with **Node.js** and **Express** that enables users to manage their personal budget using the **Envelope Budgeting** method. Users can create, update, delete, and transfer funds between budget envelopes while ensuring they do not overspend. The API follows best practices regarding endpoint naming conventions, response codes, and data validation.

🔗 Learn more about **Envelope Budgeting** [here](https://www.thebalancemoney.com/what-is-envelope-budgeting-1293682).

## Features

✅ Create and manage budget envelopes
✅ Retrieve all envelopes or a specific envelope
✅ Update envelope details and withdraw funds
✅ Transfer funds between envelopes
✅ Proper response codes and error handling
✅ Built-in validation to prevent overspending

## Project Objectives

- Develop an API using **Node.js** and **Express**
- Implement **CRUD** functionality for budget envelopes
- Create endpoints to update envelope balances
- Utilize **Git version control** to track progress
- Use the **command line** for project navigation
- Test API endpoints with **Postman**

## Prerequisites

Before running this project, ensure you have the following installed:

- **Node.js** (latest stable version)
- **NPM** (Node Package Manager)
- **Git**
- **Postman** (for API testing)

## Installation

1. **Clone the repository:**
   ```bash
   git clone git@github.com:PhilSquares/personal-budget-app.git
   cd personal-budget-app
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Start the server:**
   ```bash
   node server.js
   ```
4. **Test the API using Postman** or your browser at:
   ```
   http://localhost:3000/envelopes
   ```

## API Endpoints

| Method     | Endpoint                        | Description                        |
| ---------- | ------------------------------- | ---------------------------------- |
| **GET**    | `/envelopes`                    | Retrieve all budget envelopes      |
| **GET**    | `/envelopes/:id`                | Retrieve a specific envelope by ID |
| **POST**   | `/envelopes`                    | Create a new budget envelope       |
| **PUT**    | `/envelopes/:id`                | Update an envelope (title, budget) |
| **POST**   | `/envelopes/:id/withdraw`       | Withdraw funds from an envelope    |
| **POST**   | `/envelopes/transfer/:from/:to` | Transfer funds between envelopes   |
| **DELETE** | `/envelopes/:id`                | Delete a specific envelope         |

## Usage Example

Creating a new budget envelope via Postman:

- **Method:** POST
- **URL:** `http://localhost:3000/envelopes`
- **Body (JSON format):**
  ```json
  {
    "title": "Groceries",
    "budget": 500
  }
  ```

## Future Enhancements

🔹 Database integration for persistent storage
🔹 User authentication and authorization
🔹 Web-based frontend for easy budget management

## Contributing

Feel free to submit issues or pull requests to improve the API. Let's build something great together! 🚀

##
