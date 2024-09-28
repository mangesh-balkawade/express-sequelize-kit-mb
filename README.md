
---

# express-sequelize-kit-mb

**express-sequelize-kit-mb** is a reusable package for backend development using **Node.js**, **Express**, and **Sequelize**, featuring customizable CRUD operations and commonly used API and repository functions. It promotes clean code, encapsulation, and **DRY** (Don't Repeat Yourself) principles for easy integration into various projects.

## Features

- **CRUD operations**: Easily implement Create, Read, Update, and Delete operations.
- **Repository pattern**: Simplifies database interactions using Sequelize models.
- **API utilities**: Includes commonly used functionalities such as pagination and filtering.
- **Encapsulation**: Keeps the logic modular and maintainable.

## Installation

```bash
npm install express-sequelize-kit-mb
```

Also, install dependencies:

```bash
npm install express sequelize mysql2 dotenv cors
```

## Getting Started

### Example Project Structure

```bash
├── config
│   └── dbConfig.js
├── controllers
│   └── UserController.js
├── models
│   └── userModel.js
├── repository
│   └── userRepository.js
├── services
│   └── userService.js
├── routes
│   └── userRoutes.js
├── index.js
```

### 1. Database Configuration (`dbConfig.js`)

Configure your database connection using Sequelize:

```javascript
const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: "mysql"
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

module.exports = sequelize;
```

### 2. Define a Model (`userModel.js`)

Create a Sequelize model for `User`:

```javascript
const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbConfig");

const UserModel = sequelize.define("User", {
  userId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  age: {
    type: DataTypes.INTEGER
  },
  deleteFlag: {
    type: DataTypes.TINYINT,
    defaultValue: 0
  }
}, {
  timestamps: true
});

module.exports = UserModel;
```

### 3. Create Repository (`userRepository.js`)

```javascript
// Import the User model
const UserModel = require("../models/userModel");

// Import the Repository class from express-sequelize-kit-mb package
const { Repository } = require("express-sequelize-kit-mb");

// Define the UserRepository class extending the generic Repository
class UserRepository extends Repository {
    constructor() {
        // Call the parent Repository constructor and pass necessary parameters:
        // 1. UserModel: The Sequelize model for the User table
        // 2. Soft delete field: Leave as an empty string if not using soft delete
        // 3. Soft delete option: Set to false to disable soft deletion

        // If soft delete is required, set the field name (e.g., "deleteFlag") and true as the second and third arguments.
        super(UserModel, "deleteFlag", true);
    }
}

// Create an instance of the UserRepository
const userRepository = new UserRepository();

// Export the userRepository instance to be used in the service layer
module.exports = { userRepository };

```

### 4. Create Service (`userService.js`)

```javascript
// Import the userRepository instance from the userRepository file
const { userRepository } = require("../repository/userRepository");

// Import the generic Service class from the express-sequelize-kit-mb package
const { Service } = require("express-sequelize-kit-mb");

// Define the UserService class extending the generic Service
class UserService extends Service {
    constructor() {
        // Call the parent Service constructor and pass the userRepository instance
        // This allows the service layer to utilize the repository's methods
        super(userRepository);
    }
}

// Create an instance of the UserService
let userService = new UserService();

// Export the userService instance to be used in the controller layer
module.exports = { userService };

```

### 5. Create Controller (`UserController.js`)

Handle incoming requests in the controller:

```javascript
// Import the generic Controller class from the express-sequelize-kit-mb package
const { Controller } = require("express-sequelize-kit-mb");

// Import the userService instance from the userService file
const { userService } = require("../service/userService");


// Define the UserController class extending the generic Controller
class UserController extends Controller {
  constructor() {
    // Call the parent Controller constructor and pass the following:
    // 1. userService: The service layer object to handle business logic and repository interaction
    // 2. Enable logs: Set to true if you want to enable logging for actions within the controller
    super(userService, true);
  }
}

// Create an instance of the UserController
let userController = new UserController();

// Export the userController instance to be used in the route layer
module.exports = { userController };


```

### 6. Define Routes (`userRoutes.js`)

Route API requests to the correct controller methods:

```javascript
// Import Express framework
const express = require("express");

// Create a new router instance
const route = express.Router();

// Import the userController instance from the UserController file
const { userController } = require("../controllers/UserController");

// Import middlewares for validation and assigning organization data
const { validateFields } = require("../middlewares/validationMiddleware");
const { assignOrgInfo } = require("../middlewares/routeMiddlewares");

// Define routes for user-related operations

// POST route to save user data
// Uses the validateFields middleware to ensure 'name' and 'age' are provided
// The assignOrgInfo middleware can be used to assign user-related data such as organizationId from the JWT token
// If you want to modify or assign additional data (like roles, user permissions), you can use middlewares to do so before passing the data to the controller same like given below
route.post("/User-Save", validateFields("name", "age"), assignOrgInfo, userController.saveData);

// PATCH route to update user data by ID
// You can add middlewares here if you need to modify the request data before updating the user record
route.patch("/User-Update/:id", userController.updateData);

// DELETE route to delete user data by ID
// Middlewares can be used here to apply additional checks before deletion (e.g., role-based access control)
route.delete("/User-Delete/:id", userController.deleteData);

// GET route to fetch user data by ID
// If you need to filter or modify the response, use a middleware before calling the controller method
route.get("/User-Get-Data-By-Id/:id", userController.getDataById);

// GET route to fetch all users
// Middlewares can be added to modify or limit the data being fetched (e.g., based on user roles, organizations, etc.)
route.get("/User-Get-All-Data", userController.getAllData);

// GET route to fetch all users with pagination
// If you want to customize pagination or filtering criteria dynamically, middlewares can handle those assignments before the controller processes the request
route.get("/User-Get-All-Data-By-Pagination", userController.getAllDataWithPagination);

// Export the route to be used in other parts of the application
module.exports = route;


```

### 7. Main Application (`index.js`)

Integrate everything into the main app:

```javascript
// Load environment variables from .env file
require("dotenv").config();

// Import Express and CORS modules
const express = require("express");
const cors = require("cors");

// Initialize Express app
const app = express();

// Middleware to parse JSON requests
app.use(express.json());

// Enable CORS (Cross-Origin Resource Sharing) for all origins
app.use(cors({ origin: "*" }));

// Import and configure the database connection
require("./config/dbConfig");

// Import User routes
const UserRoutes = require("./routes/userRoutes");

// Use the imported User routes for all requests to /User endpoint
app.use("/User", UserRoutes);

// Load relationships between models (associations)
require("./models/relationships");

// Start the Express server on port 3000
app.listen(3000, () => {
  console.log("Server is started on port 3000");
});


```

### 8. **Running the App**:
   Start the server by running:
   ```bash
   npm start
   ```

   Your API will be available at `http://localhost:3000/`.
   
## Demo

For a complete demo, check out the [demo repository](https://github.com/mangesh-balkawade/express-sequelize-kit-mb-package-usage-demo).

## API Documentation

You can explore and test the API using Postman. Click the link below to view the Postman collection:

[Postman Collection for express-sequelize-kit-mb](https://www.postman.com/restless-rocket-723917/express-sequelize-kit-mb/collection/ddqu6wt/express-sequelize-kit-mb-api)

## Author

**Mangesh Balkawade**  
[GitHub](https://github.com/mangesh-balkawade)

---
