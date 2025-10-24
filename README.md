# Student Authentication API

A Node.js REST API with Express and MongoDB for student registration and authentication.

## Project Structure

```
student-api/
│
├── config/
│   └── db.js                 # Database configuration
│
├── controllers/
│   └── authController.js     # Authentication controllers
│
├── middleware/
│   └── ipMiddleware.js       # IP address extraction middleware
│
├── models/
│   ├── User.js              # User model schema
│   └── LoginHistory.js      # Login history model
│
├── routes/
│   └── authRoutes.js        # Authentication routes
│
├── .env                     # Environment variables (create from .env.example)
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore file
├── package.json            # Dependencies and scripts
└── server.js               # Main application file
```

## Installation

1. **Clone or create the project directory:**

```bash
mkdir student-api
cd student-api
```

2. **Install dependencies:**

```bash
npm install
```

3. **Edit `.env` file with your configuration:**

- Update `MONGO_URI` with your MongoDB connection string
- Change `JWT_SECRET` to a secure random string
- Adjust other settings as needed

4. **Make sure MongoDB is running:**

- Local: Start MongoDB service
- Cloud: Use MongoDB Atlas connection string

## Running the Application

**Development mode (with auto-reload):**

```bash
npm run dev
```

**Production mode:**

```bash
npm start
```

The server will start on `http://localhost:5000` (or the port specified in .env)

## API Endpoints

### 1. Register User

**Endpoint:** `POST /api/auth/register`

**Request Body:**

```json
{
  "name": "name",
  "family": "family",
  "birthdate": "2000-01-15",
  "nationalCode": "1234567890",
  "mobile": "09123456789",
  "email": "email@example.com",
  "universityName": "Sajjad University",
  "studentNumber": "400123456",
  "fieldOfStudy": "Computer Science",
  "educationalLevel": "Bachelor",
  "password": "securePassword123"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65f8a1b2c3d4e5f6g7h8i9j0",
    "name": "name",
    "family": "family",
    "nationalCode": "1234567890",
    "email": "email@example.com"
  }
}
```

### 2. Login User

**Endpoint:** `POST /api/auth/login`

**Request Body:**

```json
{
  "username": "1234567890",
  "password": "securePassword123"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "ipAddress": "192.168.1.100",
  "user": {
    "id": "65f8a1b2c3d4e5f6g7h8i9j0",
    "name": "name",
    "family": "family",
    "nationalCode": "1234567890",
    "email": "email@example.com",
    "universityName": "Sajjad University",
    "studentNumber": "400123456"
  }
}
```

## Field Validations

- **name, family:** Required, trimmed
- **birthdate:** Required, must be a valid date
- **nationalCode:** Required, unique, exactly 10 digits
- **mobile:** Required, unique, exactly 11 digits
- **email:** Required, unique, valid email format
- **universityName:** Required, trimmed
- **studentNumber:** Required, unique, trimmed
- **fieldOfStudy:** Required, trimmed
- **educationalLevel:** Required, must be one of: Associate, Bachelor, Master, PhD
- **password:** Required, minimum 6 characters (hashed before storage)

## Features

- ✅ User registration with comprehensive validation
- ✅ Secure password hashing with bcrypt
- ✅ JWT-based authentication
- ✅ Login using national code as username
- ✅ **IP address tracking for all login attempts**
- ✅ **Login history stored in separate collection**
- ✅ **Failed login attempts tracking**
- ✅ Duplicate user detection (national code, email, mobile, student number)
- ✅ Input validation and error handling
- ✅ MongoDB database integration
- ✅ RESTful API design

## Testing with cURL

**Register:**

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John",
    "family": "Doe",
    "birthdate": "2000-01-15",
    "nationalCode": "1234567890",
    "mobile": "09123456789",
    "email": "john.doe@example.com",
    "universityName": "Tehran University",
    "studentNumber": "400123456",
    "fieldOfStudy": "Computer Science",
    "educationalLevel": "Bachelor",
    "password": "securePassword123"
  }'
```

**Login:**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "1234567890",
    "password": "securePassword123"
  }'
```

## Security Notes

- Passwords are hashed using bcrypt before storage
- JWT tokens expire after 7 days (configurable in .env)
- National code is used as username for login
- All unique fields are validated to prevent duplicates
- **All login attempts (successful and failed) are logged with IP address**
- **IP addresses are captured even behind proxies/load balancers**
- Never commit your `.env` file to version control

## Login History Collection

The `LoginHistory` collection stores:

- **user**: Reference to User document (ObjectId)
- **nationalCode**: National code used for login
- **ipAddress**: Client IP address
- **userAgent**: Browser/client information
- **loginStatus**: 'success' or 'failed'
- **loginTime**: Timestamp of login attempt
- **createdAt/updatedAt**: Auto-generated timestamps

## Dependencies

- **express:** Web framework
- **mongoose:** MongoDB ODM
- **bcryptjs:** Password hashing
- **jsonwebtoken:** JWT authentication
- **dotenv:** Environment variables management
- **nodemon:** Development auto-reload (dev dependency)

## License

ISC
