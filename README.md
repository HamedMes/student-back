# Student Authentication API

A Node.js REST API with Express and MongoDB for student registration and authentication.

## Project Structure

```
student-auth-api/
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
mkdir student-auth-api
cd student-auth-api
```

2. **Install dependencies:**

```bash
npm install
```

3. **Create environment file:**

```bash
cp .env.example .env
```

4. **Edit `.env` file with your configuration:**

- Update `MONGO_URI` with your MongoDB connection string
- Change `JWT_SECRET` to a secure random string
- Adjust other settings as needed

5. **Make sure MongoDB is running:**

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

### Authentication Endpoints

### 1. Register User

**Endpoint:** `POST /api/auth/register`

**Request Body:**

```json
{
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
    "name": "John",
    "family": "Doe",
    "nationalCode": "1234567890",
    "email": "john.doe@example.com"
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
    "name": "John",
    "family": "Doe",
    "nationalCode": "1234567890",
    "email": "john.doe@example.com",
    "universityName": "Tehran University",
    "studentNumber": "400123456"
  }
}
```

### Team Management Endpoints

### 3. Create Team

**Endpoint:** `POST /api/teams/create`
**Authentication:** Required (Bearer Token)

**Request Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Request Body:**

```json
{
  "teamName": "Awesome Team",
  "memberNationalCodes": ["0987654321", "1122334455"]
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Team created successfully",
  "team": {
    "id": "65f8a1b2c3d4e5f6g7h8i9j0",
    "teamName": "Awesome Team",
    "leader": {
      "id": "65f8a1b2c3d4e5f6g7h8i9j0",
      "name": "John",
      "family": "Doe",
      "nationalCode": "1234567890"
    },
    "members": [
      {
        "nationalCode": "0987654321",
        "name": "Jane",
        "family": "Smith",
        "joinedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "totalMembers": 2,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 4. Edit Team

**Endpoint:** `PUT /api/teams/edit`
**Authentication:** Required (Bearer Token - Leader only)

**Request Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Request Body (can include teamName, memberNationalCodes, or both):**

```json
{
  "teamName": "New Awesome Team Name",
  "memberNationalCodes": ["0987654321", "1122334455", "9988776655"]
}
```

**Or edit only team name:**

```json
{
  "teamName": "New Team Name"
}
```

**Or edit only members:**

```json
{
  "memberNationalCodes": ["0987654321", "9988776655"]
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Team name and members updated successfully",
  "team": {
    "id": "65f8a1b2c3d4e5f6g7h8i9j0",
    "teamName": "New Awesome Team Name",
    "leader": {
      "id": "65f8a1b2c3d4e5f6g7h8i9j0",
      "name": "John",
      "family": "Doe",
      "nationalCode": "1234567890"
    },
    "members": [
      {
        "nationalCode": "0987654321",
        "name": "Jane",
        "family": "Smith",
        "joinedAt": "2024-01-15T11:00:00.000Z"
      },
      {
        "nationalCode": "1122334455",
        "name": "Bob",
        "family": "Johnson",
        "joinedAt": "2024-01-15T11:00:00.000Z"
      }
    ],
    "totalMembers": 3,
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

### 5. Get My Team

**Endpoint:** `GET /api/teams/my-team`
**Authentication:** Required (Bearer Token)

**Request Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Success Response (200):**

```json
{
  "success": true,
  "team": {
    "id": "65f8a1b2c3d4e5f6g7h8i9j0",
    "teamName": "Awesome Team",
    "isLeader": true,
    "leader": {
      "id": "65f8a1b2c3d4e5f6g7h8i9j0",
      "name": "John",
      "family": "Doe",
      "nationalCode": "1234567890"
    },
    "members": [
      {
        "nationalCode": "0987654321",
        "name": "Jane",
        "family": "Smith",
        "joinedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "totalMembers": 2,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### User Profile Endpoints

### 6. Get User Profile

**Endpoint:** `GET /api/users/profile`
**Authentication:** Required (Bearer Token)

**Request Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Success Response (200):**

```json
{
  "success": true,
  "user": {
    "id": "65f8a1b2c3d4e5f6g7h8i9j0",
    "name": "John",
    "family": "Doe",
    "birthdate": "2000-01-15T00:00:00.000Z",
    "nationalCode": "1234567890",
    "mobile": "09123456789",
    "email": "john.doe@example.com",
    "universityName": "Tehran University",
    "studentNumber": "400123456",
    "fieldOfStudy": "Computer Science",
    "educationalLevel": "Bachelor",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

### 7. Edit User Profile

**Endpoint:** `PUT /api/users/profile`
**Authentication:** Required (Bearer Token)

**Request Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Request Body (all fields optional, include only what you want to update):**

```json
{
  "name": "Jonathan",
  "family": "Doe",
  "birthdate": "2000-01-15",
  "mobile": "09123456789",
  "email": "newemail@example.com",
  "universityName": "Sharif University",
  "studentNumber": "400123456",
  "fieldOfStudy": "Software Engineering",
  "educationalLevel": "Master",
  "currentPassword": "oldPassword123",
  "password": "newPassword456"
}
```

**Note:** To change password, both `currentPassword` and `password` are required.

**Success Response (200):**

```json
{
  "success": true,
  "message": "Profile updated successfully (name, email, educational level)",
  "user": {
    "id": "65f8a1b2c3d4e5f6g7h8i9j0",
    "name": "Jonathan",
    "family": "Doe",
    "birthdate": "2000-01-15T00:00:00.000Z",
    "nationalCode": "1234567890",
    "mobile": "09123456789",
    "email": "newemail@example.com",
    "universityName": "Sharif University",
    "studentNumber": "400123456",
    "fieldOfStudy": "Software Engineering",
    "educationalLevel": "Master",
    "updatedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

### Dashboard Endpoint

### 8. Get Dashboard

**Endpoint:** `GET /api/dashboard`
**Authentication:** Required (Bearer Token)

**Request Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Success Response (200):**

```json
{
  "success": true,
  "dashboard": {
    "user": {
      "id": "65f8a1b2c3d4e5f6g7h8i9j0",
      "name": "John",
      "family": "Doe"
    },
    "daysSinceRegistration": 45,
    "team": {
      "teamName": "Awesome Team",
      "isLeader": true,
      "members": [
        {
          "id": "65f8a1b2c3d4e5f6g7h8i9j1",
          "name": "Jane",
          "family": "Smith",
          "universityName": "Tehran University"
        },
        {
          "id": "65f8a1b2c3d4e5f6g7h8i9j2",
          "name": "Bob",
          "family": "Johnson",
          "universityName": "Sharif University"
        }
      ],
      "totalMembers": 3
    }
  }
}
```

**If user has no team:**

```json
{
  "success": true,
  "dashboard": {
    "user": {
      "id": "65f8a1b2c3d4e5f6g7h8i9j0",
      "name": "John",
      "family": "Doe"
    },
    "daysSinceRegistration": 45,
    "team": null
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
- ✅ IP address tracking for all login attempts
- ✅ Login history stored in separate collection
- ✅ Failed login attempts tracking
- ✅ **Team management system**
- ✅ **Leader-based team creation**
- ✅ **Add/edit team members by national code**
- ✅ **One team per user restriction**
- ✅ **Protected routes with JWT middleware**
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

**Create Team:**

```bash
curl -X POST http://localhost:5000/api/teams/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "teamName": "Awesome Team",
    "memberNationalCodes": ["0987654321", "1122334455"]
  }'
```

**Edit Team:**

```bash
# Edit both team name and members
curl -X PUT http://localhost:5000/api/teams/edit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "teamName": "New Team Name",
    "memberNationalCodes": ["0987654321", "9988776655"]
  }'

# Edit only team name
curl -X PUT http://localhost:5000/api/teams/edit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "teamName": "New Team Name"
  }'

# Edit only members
curl -X PUT http://localhost:5000/api/teams/edit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "memberNationalCodes": ["0987654321"]
  }'
```

**Get My Team:**

```bash
curl -X GET http://localhost:5000/api/teams/my-team \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Get Dashboard:**

```bash
curl -X GET http://localhost:5000/api/dashboard \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Get User Profile:**

```bash
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Edit User Profile:**

```bash
curl -X PUT http://localhost:5000/api/users/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Jonathan",
    "email": "newemail@example.com",
    "universityName": "Sharif University"
  }'
```

**Change Password:**

```bash
curl -X PUT http://localhost:5000/api/users/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "currentPassword": "oldPassword123",
    "password": "newPassword456"
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

## Team Collection

The `Team` collection stores:

- **teamName**: Unique team name (3-50 characters)
- **leader**: Reference to leader's User document (ObjectId)
- **leaderNationalCode**: Leader's national code
- **members**: Array of member objects with:
  - user (ObjectId reference)
  - nationalCode
  - name
  - family
  - joinedAt (timestamp)
- **maxMembers**: Maximum number of members (default: 10, max: 50)
- **isActive**: Team status (boolean)
- **createdAt/updatedAt**: Auto-generated timestamps

### Team Rules:

- Each user can only be in ONE team (either as leader or member)
- A user cannot create a team if they're already in one
- Team names must be unique
- Leader cannot be added as a member
- Only the leader can edit team members
- Members are identified by their national code

## Dependencies

- **express:** Web framework
- **mongoose:** MongoDB ODM
- **bcryptjs:** Password hashing
- **jsonwebtoken:** JWT authentication
- **dotenv:** Environment variables management
- **nodemon:** Development auto-reload (dev dependency)

## License

ISC
