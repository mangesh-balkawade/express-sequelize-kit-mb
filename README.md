
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

const UserModel = require("../models/userModel");
const { Repository } = require("express-sequelize-kit-mb")

class UserRepository extends Repository {
    constructor() {
        // set as per your table structure if you want to use soft delete option or not 
        super(UserModel, "", false);
    }
}

const userRepository = new UserRepository();

module.exports = { userRepository };
```

### 4. Create Service (`userService.js`)

Use the repository inside a service:

```javascript
const { userRepository } = require("../repository/userRepository");
const { Service } = require("express-sequelize-kit-mb")

class UserService extends Service {
    constructor() {
        super(userRepository)
    }
}

let userService = new UserService();

module.exports = { userService };
```

### 5. Create Controller (`UserController.js`)

Handle incoming requests in the controller:

```javascript
const { Controller } = require("express-sequelize-kit-mb")
const { userService } = require("../service/userService");
const sequelize = require("../config/dbConfig");

class UserController extends Controller {
  constructor() {
    super(userService, true);
  }
}

let userController = new UserController();

module.exports = { userController };

```

### 6. Define Routes (`userRoutes.js`)

Route API requests to the correct controller methods:

```javascript
const express = require("express");
const route = express.Router();
const { userController } = require("../controllers/UserController");

// If you want to add validation or have to assign user data like role ,organizationId used middlewares 

route.post("/User-Save", userController.saveData);

route.patch("/User-Update/:id", userController.updateData);

route.delete("/User-Delete/:id", userController.deleteData);

route.get("/User-Get-Data-By-Id/:id", userController.getDataById);

route.get("/User-Get-All-Data", userController.getAllData);

route.get("/User-Get-All-Data-By-Pagination", userController.getAllDataWithPagination);

route.post("/Service-Test", userController.test);

module.exports = route;

```

### 7. Main Application (`index.js`)

Integrate everything into the main app:

```javascript
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

require("./config/dbConfig");

const UserRoutes = require("./routes/userRoutes");

app.use("/User", UserRoutes);

app.listen(3000, () => {
  console.log("Server is started on 3000 port");
});

```

## How to Use

1. Run the server:
   ```bash
   node index.js
   ```
   
2. Access the API endpoints:
   - `POST /User/User-Save`: Create a new user.
   - `PATCH /User/User-Update/:id`: Update a user by ID.
   - `DELETE /User/User-Delete/:id`: Delete a user by ID.
   - `GET /User/User-Get-Data-By-Id/:id`: Get user by ID.
   - `GET /User/User-Get-All-Data`: Get all users.
   - `GET /User/User-Get-All-Data-By-Pagination`: Get all users with pagination.

## Author

**Mangesh Balkawade**  
[GitHub](https://github.com/mangesh-balkawade)

---
