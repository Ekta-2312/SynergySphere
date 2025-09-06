# SynergySphere Backend API

A comprehensive project management backend built with Node.js, Express, and MongoDB.

## Features

- **Authentication & Authorization**: JWT-based auth with email verification
- **Project Management**: Create, manage, and collaborate on projects
- **Task Management**: Kanban-style task boards with drag-and-drop
- **Team Collaboration**: Real-time discussions and notifications
- **Google OAuth**: Social login integration

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + Passport.js
- **Email**: Nodemailer
- **Security**: bcryptjs, CORS, express-session

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd project/backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the backend directory:

   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/synergysphere

   # JWT Secret
   JWT_SECRET=your-super-secret-jwt-key-here

   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password

   # Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret

   # URLs
   FRONTEND_URL=http://localhost:5173
   BACKEND_URL=http://localhost:5000

   # Session
   SESSION_SECRET=your-session-secret
   NODE_ENV=development
   ```

4. **Start the server**
   ```bash
   npm start
   ```

## API Documentation

### Authentication Endpoints

#### POST `/api/auth/register`

Register a new user account.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User registered, OTP sent to email",
  "user": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### POST `/api/auth/verify`

Verify user email with OTP.

**Request Body:**

```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

#### POST `/api/auth/login`

Login with email and password.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**

```json
{
  "success": true,
  "token": "jwt-token-here",
  "user": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Project Endpoints

All project endpoints require authentication via Bearer token.

#### GET `/api/projects`

Get all projects for authenticated user.

#### POST `/api/projects`

Create a new project.

**Request Body:**

```json
{
  "title": "My Project",
  "description": "Project description",
  "dueDate": "2025-12-31",
  "color": "#8B5CF6"
}
```

#### GET `/api/projects/:id`

Get specific project details.

#### PUT `/api/projects/:id`

Update project (owner only).

#### DELETE `/api/projects/:id`

Delete project (owner only).

### Task Endpoints

#### GET `/api/tasks/project/:projectId`

Get all tasks for a project.

#### POST `/api/tasks`

Create a new task.

**Request Body:**

```json
{
  "title": "Task Title",
  "description": "Task description",
  "project": "project-id",
  "assignee": "user-id",
  "priority": "high",
  "dueDate": "2025-10-15",
  "tags": ["frontend", "urgent"]
}
```

#### PUT `/api/tasks/:id`

Update task.

#### DELETE `/api/tasks/:id`

Delete task.

### Discussion Endpoints

#### GET `/api/discussions/project/:projectId`

Get project discussions.

#### POST `/api/discussions`

Create new discussion.

### Notification Endpoints

#### GET `/api/notifications`

Get user notifications.

#### GET `/api/notifications/unread-count`

Get unread notification count.

## Database Schema

### User (Register)

```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  provider: String (local/google),
  isVerified: Boolean,
  otpHash: String,
  otpExpires: Date,
  createdAt: Date
}
```

### Project

```javascript
{
  title: String,
  description: String,
  owner: ObjectId (User),
  members: [ObjectId (User)],
  status: String (active/completed/on-hold/cancelled),
  color: String,
  dueDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Task

```javascript
{
  title: String,
  description: String,
  project: ObjectId (Project),
  assignee: ObjectId (User),
  creator: ObjectId (User),
  status: String (todo/in-progress/in-review/done),
  priority: String (low/medium/high/urgent),
  dueDate: Date,
  completedAt: Date,
  tags: [String],
  estimatedHours: Number,
  actualHours: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Email Verification**: OTP-based email confirmation
- **Access Control**: Role-based permissions
- **CORS Protection**: Cross-origin request filtering
- **Input Validation**: Server-side validation for all endpoints

## Error Handling

The API uses consistent error response format:

```json
{
  "error": "Error message",
  "success": false,
  "message": "Detailed error description"
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.
