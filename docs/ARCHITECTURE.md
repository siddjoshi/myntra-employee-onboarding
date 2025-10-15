# Architecture Documentation

## Table of Contents
- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Application Layers](#application-layers)
- [Data Flow](#data-flow)
- [Database Design](#database-design)
- [Authentication & Authorization](#authentication--authorization)
- [File Storage](#file-storage)
- [Security Architecture](#security-architecture)
- [Scalability Considerations](#scalability-considerations)
- [Deployment Architecture](#deployment-architecture)

## Overview

The Myntra Employee Onboarding System is a full-stack web application built using a monorepo architecture. It combines a Next.js frontend with an Express.js backend, sharing dependencies through a single `package.json` file. The system uses MongoDB as the primary database and implements JWT-based authentication.

### Key Characteristics
- **Monorepo Architecture**: Single repository containing both frontend and backend
- **Microservices-Ready**: Modular design allows future separation of services
- **RESTful API**: Standard HTTP methods and JSON communication
- **Stateless Backend**: JWT tokens eliminate server-side session storage
- **Responsive Design**: Mobile-first UI using Tailwind CSS

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         Next.js Frontend (Port 3000)                     │   │
│  │  - React Components                                       │   │
│  │  - TypeScript                                            │   │
│  │  - Tailwind CSS                                          │   │
│  │  - Client-side Routing                                   │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS/REST API
                              │
┌─────────────────────────────▼─────────────────────────────────────┐
│                      Application Layer                             │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │         Express.js Backend (Port 5000)                   │     │
│  │  ┌────────────────────────────────────────────────────┐  │     │
│  │  │              Middleware Layer                      │  │     │
│  │  │  - CORS                                            │  │     │
│  │  │  - Body Parser                                     │  │     │
│  │  │  - Authentication (JWT)                            │  │     │
│  │  │  - Authorization (RBAC)                            │  │     │
│  │  │  - File Upload (Multer)                            │  │     │
│  │  └────────────────────────────────────────────────────┘  │     │
│  │  ┌────────────────────────────────────────────────────┐  │     │
│  │  │              Route Handlers                        │  │     │
│  │  │  - /api/auth                                       │  │     │
│  │  │  - /api/tasks                                      │  │     │
│  │  │  - /api/documents                                  │  │     │
│  │  │  - /api/training                                   │  │     │
│  │  │  - /api/dashboard                                  │  │     │
│  │  └────────────────────────────────────────────────────┘  │     │
│  │  ┌────────────────────────────────────────────────────┐  │     │
│  │  │           Business Logic Layer                     │  │     │
│  │  │  - Task Management                                 │  │     │
│  │  │  - Document Verification                           │  │     │
│  │  │  - Training Progress                               │  │     │
│  │  │  - Analytics Calculation                           │  │     │
│  │  └────────────────────────────────────────────────────┘  │     │
│  └──────────────────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────────────────┘
                              │
                              │ Mongoose ODM
                              │
┌─────────────────────────────▼─────────────────────────────────────┐
│                        Data Layer                                  │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │         MongoDB Database (Port 27017)                    │     │
│  │  ┌────────────────────────────────────────────────────┐  │     │
│  │  │              Collections                           │  │     │
│  │  │  - users                                           │  │     │
│  │  │  - tasks                                           │  │     │
│  │  │  - documents                                       │  │     │
│  │  │  - trainingmodules                                 │  │     │
│  │  │  - trainingprogresses                              │  │     │
│  │  └────────────────────────────────────────────────────┘  │     │
│  └──────────────────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────▼─────────────────────────────────────┐
│                      Storage Layer                                 │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │              File System Storage                         │     │
│  │  - /uploads/documents/                                   │     │
│  │  - /uploads/profiles/                                    │     │
│  └──────────────────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────────────────┘
```

### Component Interaction Diagram

```
┌──────────────┐          ┌──────────────┐          ┌──────────────┐
│   Browser    │          │    Next.js   │          │   Express    │
│              │          │   Frontend   │          │   Backend    │
└──────┬───────┘          └──────┬───────┘          └──────┬───────┘
       │                         │                         │
       │  1. Request Page        │                         │
       │────────────────────────>│                         │
       │                         │                         │
       │  2. Render HTML + JS    │                         │
       │<────────────────────────│                         │
       │                         │                         │
       │  3. API Call            │  4. Forward Request     │
       │────────────────────────>│────────────────────────>│
       │                         │                         │
       │                         │  5. Process & Query DB  │
       │                         │                         │
       │                         │  6. Return JSON         │
       │  7. Forward Response    │<────────────────────────│
       │<────────────────────────│                         │
       │                         │                         │
       │  8. Update UI           │                         │
       │                         │                         │
```

## Technology Stack

### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.0.0 | React framework with SSR/SSG |
| React | 18.2.0 | UI component library |
| TypeScript | 5.3.0 | Type-safe JavaScript |
| Tailwind CSS | 3.3.0 | Utility-first CSS framework |
| Axios | 1.6.0 | HTTP client for API calls |
| React Icons | 4.12.0 | Icon library |
| Recharts | 2.10.0 | Charting library for analytics |
| date-fns | 2.30.0 | Date manipulation |

### Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | JavaScript runtime |
| Express.js | 4.18.2 | Web application framework |
| MongoDB | 8.0.0 | NoSQL database |
| Mongoose | 8.0.0 | MongoDB ODM |
| JWT | 9.0.2 | Authentication tokens |
| bcryptjs | 2.4.3 | Password hashing |
| Multer | 1.4.5 | File upload handling |
| CORS | 2.8.5 | Cross-origin resource sharing |
| dotenv | 16.3.1 | Environment variable management |

### Development Tools

| Tool | Purpose |
|------|---------|
| nodemon | Auto-restart server on changes |
| concurrently | Run multiple commands simultaneously |
| ESLint | Code linting |
| TypeScript Compiler | Type checking |

## Application Layers

### 1. Presentation Layer (Frontend)

**Location**: `/pages`, `/hooks`, `/utils`, `/styles`

**Responsibilities**:
- User interface rendering
- User input handling
- Client-side routing
- State management
- API communication

**Key Components**:

```typescript
// Page Component Structure
pages/
  ├── _app.tsx           // App wrapper with global state
  ├── index.tsx          // Login/Register page
  └── dashboard.tsx      // Main dashboard

// Custom Hooks
hooks/
  └── useAuth.ts         // Authentication state management

// API Client
utils/
  └── api.ts             // Centralized API calls

// Styling
styles/
  └── globals.css        // Global styles and Tailwind config
```

**Data Flow in Frontend**:
```
User Action → Component → Hook → API Client → Backend
                ↑                                  │
                └──────── State Update ←───────────┘
```

### 2. API Layer (Backend Routes)

**Location**: `/server/routes`

**Responsibilities**:
- Request routing
- Input validation
- Response formatting
- Error handling

**Route Structure**:
```javascript
server/routes/
  ├── auth.js          // Authentication & user management
  ├── tasks.js         // Task CRUD operations
  ├── documents.js     // Document upload & verification
  ├── training.js      // Training modules & progress
  └── dashboard.js     // Analytics & statistics
```

**Request Processing Flow**:
```
HTTP Request
    ↓
Route Handler
    ↓
Middleware (Auth, Validation)
    ↓
Business Logic
    ↓
Database Operation
    ↓
Response Formatting
    ↓
HTTP Response
```

### 3. Business Logic Layer

**Location**: Embedded in routes and models

**Responsibilities**:
- Data validation
- Business rule enforcement
- Complex calculations
- Workflow management

**Key Functions**:
```javascript
// Example: Onboarding Progress Calculation
async function updateOnboardingProgress(userId) {
  const allTasks = await Task.find({ assignedTo: userId });
  const completedTasks = allTasks.filter(task => task.status === 'completed');
  const progress = Math.round((completedTasks.length / allTasks.length) * 100);
  
  await User.findByIdAndUpdate(userId, {
    onboardingProgress: progress,
    onboardingStatus: progress === 100 ? 'completed' : 
                      progress > 0 ? 'in_progress' : 'pending'
  });
}
```

### 4. Data Access Layer

**Location**: `/server/models`

**Responsibilities**:
- Database schema definition
- Data validation rules
- Model relationships
- Pre/post hooks

**Model Structure**:
```javascript
server/models/
  ├── User.js          // User schema & methods
  ├── Task.js          // Task schema & methods
  ├── Document.js      // Document schema & methods
  └── Training.js      // Training schema & methods
```

### 5. Middleware Layer

**Location**: `/server/middleware`

**Responsibilities**:
- Authentication verification
- Role-based authorization
- Request logging
- Error handling

**Middleware Stack**:
```javascript
// Request Pipeline
app.use(cors());                    // 1. Enable CORS
app.use(express.json());            // 2. Parse JSON body
app.use(authMiddleware);            // 3. Verify JWT token
app.use(roleMiddleware('hr_admin')); // 4. Check permissions
// ... route handler
```

## Data Flow

### User Registration Flow

```
┌─────────┐     ┌──────────┐     ┌─────────┐     ┌──────────┐
│ Browser │────>│ Frontend │────>│ Backend │────>│ Database │
└─────────┘     └──────────┘     └─────────┘     └──────────┘
    │                 │                │                │
    │ 1. Submit       │                │                │
    │    Form         │                │                │
    │────────────────>│                │                │
    │                 │ 2. POST        │                │
    │                 │    /register   │                │
    │                 │───────────────>│                │
    │                 │                │ 3. Check       │
    │                 │                │    Existing    │
    │                 │                │───────────────>│
    │                 │                │ 4. User Not    │
    │                 │                │    Found       │
    │                 │                │<───────────────│
    │                 │                │ 5. Hash        │
    │                 │                │    Password    │
    │                 │                │ 6. Save User   │
    │                 │                │───────────────>│
    │                 │                │ 7. User Saved  │
    │                 │                │<───────────────│
    │                 │ 8. JWT Token   │                │
    │                 │<───────────────│                │
    │ 9. Store Token  │                │                │
    │<────────────────│                │                │
    │ 10. Redirect    │                │                │
```

### Task Completion Flow

```
┌─────────┐     ┌──────────┐     ┌─────────┐     ┌──────────┐
│  User   │────>│ Frontend │────>│ Backend │────>│ Database │
└─────────┘     └──────────┘     └─────────┘     └──────────┘
    │                 │                │                │
    │ 1. Mark Task    │                │                │
    │    Complete     │                │                │
    │────────────────>│                │                │
    │                 │ 2. PATCH       │                │
    │                 │    /tasks/:id  │                │
    │                 │───────────────>│                │
    │                 │                │ 3. Verify      │
    │                 │                │    Ownership   │
    │                 │                │ 4. Update      │
    │                 │                │    Task        │
    │                 │                │───────────────>│
    │                 │                │ 5. Calculate   │
    │                 │                │    Progress    │
    │                 │                │ 6. Update User │
    │                 │                │    Progress    │
    │                 │                │───────────────>│
    │                 │ 7. Success     │                │
    │                 │<───────────────│                │
    │ 8. Update UI    │                │                │
    │<────────────────│                │                │
```

### Document Upload & Verification Flow

```
┌──────────┐   ┌──────────┐   ┌─────────┐   ┌──────────┐   ┌──────────┐
│ New Hire │──>│ Frontend │──>│ Backend │──>│   Disk   │   │ Database │
└──────────┘   └──────────┘   └─────────┘   └──────────┘   └──────────┘
     │              │              │               │              │
     │ 1. Select    │              │               │              │
     │    File      │              │               │              │
     │─────────────>│              │               │              │
     │              │ 2. POST      │               │              │
     │              │    /upload   │               │              │
     │              │ (multipart)  │               │              │
     │              │─────────────>│               │              │
     │              │              │ 3. Validate   │              │
     │              │              │    File       │              │
     │              │              │ 4. Save File  │              │
     │              │              │──────────────>│              │
     │              │              │ 5. Create     │              │
     │              │              │    Document   │              │
     │              │              │    Record     │              │
     │              │              │──────────────────────────────>│
     │              │ 6. Success   │               │              │
     │              │<─────────────│               │              │
     │ 7. Show      │              │               │              │
     │    Success   │              │               │              │
     │<─────────────│              │               │              │

                    --- HR Admin Reviews ---

┌──────────┐   ┌──────────┐   ┌─────────┐   ┌──────────┐
│ HR Admin │──>│ Frontend │──>│ Backend │──>│ Database │
└──────────┘   └──────────┘   └─────────┘   └──────────┘
     │              │              │              │
     │ 8. View      │              │              │
     │    Document  │              │              │
     │─────────────>│              │              │
     │              │ 9. GET       │              │
     │              │    /docs/:id │              │
     │              │─────────────>│              │
     │              │              │ 10. Fetch    │
     │              │              │     Document │
     │              │              │─────────────>│
     │ 11. Verify   │              │              │
     │     or       │              │              │
     │     Reject   │              │              │
     │─────────────>│              │              │
     │              │ 12. PATCH    │              │
     │              │     /verify  │              │
     │              │─────────────>│              │
     │              │              │ 13. Update   │
     │              │              │     Status   │
     │              │              │─────────────>│
     │              │ 14. Notify   │              │
     │              │     New Hire │              │
```

## Database Design

### Entity Relationship Diagram

```
┌─────────────────┐
│      User       │
├─────────────────┤
│ _id (PK)        │
│ email           │
│ password        │
│ firstName       │
│ lastName        │
│ role            │◄────────┐
│ department      │         │
│ designation     │         │
│ employeeId      │         │
│ manager (FK)    │─────────┘
│ buddy (FK)      │─────────┐
│ onboardingProgress        │
│ onboardingStatus          │
└────────┬────────┘         │
         │                  │
         │ 1:N              │
         │                  │
    ┌────┴────┐        ┌────┴────┐
    │  Task   │        │Document │
    ├─────────┤        ├─────────┤
    │ _id (PK)│        │ _id (PK)│
    │ title   │        │ userId  │
    │ assignedTo(FK)   │ documentType
    │ assignedBy(FK)   │ fileName│
    │ category│        │ fileUrl │
    │ status  │        │ status  │
    │ priority│        │ verifiedBy(FK)
    └─────────┘        └─────────┘
         
         │ 1:N
         │
    ┌────┴──────────┐
    │TrainingProgress│
    ├───────────────┤
    │ _id (PK)      │
    │ userId (FK)   │
    │ moduleId (FK) │
    │ status        │
    │ progress      │
    │ quizScore     │
    └───────┬───────┘
            │
            │ N:1
            │
    ┌───────┴───────┐
    │TrainingModule │
    ├───────────────┤
    │ _id (PK)      │
    │ title         │
    │ category      │
    │ content       │
    │ quiz          │
    │ passingScore  │
    └───────────────┘
```

### Collection Schemas

#### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (hashed, required),
  firstName: String (required),
  lastName: String (required),
  role: Enum (required),
  department: String (required),
  designation: String (required),
  joiningDate: Date (required),
  employeeId: String (unique),
  phone: String,
  address: String,
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },
  manager: ObjectId (ref: User),
  buddy: ObjectId (ref: User),
  profilePicture: String,
  onboardingStatus: Enum,
  onboardingProgress: Number,
  createdAt: Date,
  updatedAt: Date
}
```

#### Tasks Collection
```javascript
{
  _id: ObjectId,
  title: String (required),
  description: String (required),
  category: Enum (required),
  priority: Enum (required),
  assignedTo: ObjectId (ref: User, required),
  assignedBy: ObjectId (ref: User),
  status: Enum,
  dueDate: Date (required),
  completedAt: Date,
  isCompleted: Boolean,
  order: Number,
  dependencies: [ObjectId] (ref: Task),
  attachments: [{
    fileName: String,
    fileUrl: String,
    uploadedAt: Date
  }],
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### Documents Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, required),
  documentType: Enum (required),
  fileName: String (required),
  fileUrl: String (required),
  fileSize: Number,
  mimeType: String,
  status: Enum,
  verifiedBy: ObjectId (ref: User),
  verifiedAt: Date,
  rejectionReason: String,
  uploadedAt: Date,
  expiryDate: Date,
  isRequired: Boolean
}
```

### Indexes

```javascript
// User Collection
users.createIndex({ email: 1 }, { unique: true });
users.createIndex({ employeeId: 1 }, { unique: true, sparse: true });
users.createIndex({ role: 1, department: 1 });

// Task Collection
tasks.createIndex({ assignedTo: 1, status: 1 });
tasks.createIndex({ dueDate: 1, status: 1 });
tasks.createIndex({ category: 1 });

// Document Collection
documents.createIndex({ userId: 1, status: 1 });
documents.createIndex({ documentType: 1 });

// Training Progress Collection
trainingprogresses.createIndex({ userId: 1, moduleId: 1 }, { unique: true });
```

## Authentication & Authorization

### JWT Token Structure

```javascript
{
  // Header
  {
    "alg": "HS256",
    "typ": "JWT"
  },
  
  // Payload
  {
    "userId": "507f1f77bcf86cd799439011",
    "email": "john.doe@myntra.com",
    "role": "new_hire",
    "iat": 1697376000,
    "exp": 1697980800  // 7 days
  },
  
  // Signature
  HMACSHA256(
    base64UrlEncode(header) + "." +
    base64UrlEncode(payload),
    process.env.JWT_SECRET
  )
}
```

### Authentication Flow

```
┌─────────┐           ┌──────────┐           ┌─────────┐
│ Client  │           │ Backend  │           │Database │
└────┬────┘           └─────┬────┘           └────┬────┘
     │                      │                     │
     │  POST /auth/login    │                     │
     │─────────────────────>│                     │
     │  {email, password}   │                     │
     │                      │  Find User          │
     │                      │────────────────────>│
     │                      │                     │
     │                      │  User Data          │
     │                      │<────────────────────│
     │                      │                     │
     │                      │  Compare Password   │
     │                      │  (bcrypt.compare)   │
     │                      │                     │
     │                      │  Generate JWT       │
     │                      │  (jwt.sign)         │
     │                      │                     │
     │  { token, user }     │                     │
     │<─────────────────────│                     │
     │                      │                     │
     │  Store Token         │                     │
     │  (localStorage)      │                     │
     │                      │                     │
     │  Subsequent Requests │                     │
     │  Authorization:      │                     │
     │  Bearer <token>      │                     │
     │─────────────────────>│                     │
     │                      │  Verify Token       │
     │                      │  (jwt.verify)       │
     │                      │                     │
     │                      │  Decode Payload     │
     │                      │  req.user = payload │
     │                      │                     │
     │  Protected Resource  │                     │
     │<─────────────────────│                     │
```

### Role-Based Access Control (RBAC)

```javascript
// Permission Matrix
const permissions = {
  new_hire: [
    'view_own_profile',
    'update_own_profile',
    'view_own_tasks',
    'update_own_task_status',
    'upload_own_documents',
    'view_own_training',
    'complete_training'
  ],
  
  manager: [
    'view_team_members',
    'view_team_progress',
    'create_team_tasks',
    'view_team_documents',
    'comment_on_progress'
  ],
  
  buddy: [
    'view_mentee_profile',
    'view_mentee_progress',
    'provide_mentee_feedback'
  ],
  
  hr_admin: [
    'full_access',  // All operations
    'create_users',
    'assign_managers',
    'assign_buddies',
    'create_tasks',
    'verify_documents',
    'create_training_modules',
    'view_analytics',
    'delete_resources'
  ]
};

// Middleware Implementation
const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'You do not have permission to perform this action' 
      });
    }
    
    next();
  };
};

// Usage
router.post('/tasks', 
  authMiddleware, 
  roleMiddleware('hr_admin', 'manager'), 
  createTask
);
```

## File Storage

### Current Implementation (Local File System)

```
project-root/
└── uploads/
    ├── documents/
    │   ├── aadhaar-1697376000-123456.pdf
    │   ├── pan_card-1697376000-789012.jpg
    │   └── passport-1697376000-345678.pdf
    └── profiles/
        ├── profile-1697376000-123456.jpg
        └── profile-1697376000-789012.png
```

### File Upload Configuration

```javascript
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/documents/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, PDF, DOC, and DOCX are allowed.'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter
});
```

### Future Cloud Storage Integration

```javascript
// AWS S3 Configuration (Future)
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const uploadToS3 = (file) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `documents/${Date.now()}-${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'private'
  };
  
  return s3.upload(params).promise();
};
```

## Security Architecture

### Security Layers

```
┌─────────────────────────────────────────────────────────┐
│              Application Security Layers                 │
├─────────────────────────────────────────────────────────┤
│ 1. Transport Layer Security (HTTPS/TLS)                 │
│    - Encrypted communication                             │
│    - SSL/TLS certificates                                │
├─────────────────────────────────────────────────────────┤
│ 2. Authentication Layer                                  │
│    - JWT token verification                              │
│    - Password hashing (bcrypt)                           │
│    - Session management                                  │
├─────────────────────────────────────────────────────────┤
│ 3. Authorization Layer                                   │
│    - Role-based access control (RBAC)                    │
│    - Resource ownership validation                       │
│    - Permission checking                                 │
├─────────────────────────────────────────────────────────┤
│ 4. Input Validation Layer                                │
│    - Request body validation                             │
│    - File type/size validation                           │
│    - SQL injection prevention (MongoDB)                  │
│    - XSS prevention                                      │
├─────────────────────────────────────────────────────────┤
│ 5. Rate Limiting Layer                                   │
│    - API rate limiting                                   │
│    - DDoS protection                                     │
│    - Brute force prevention                              │
├─────────────────────────────────────────────────────────┤
│ 6. Data Protection Layer                                 │
│    - Encrypted data at rest                              │
│    - Secure file storage                                 │
│    - Audit logging                                       │
└─────────────────────────────────────────────────────────┘
```

### Security Best Practices Implemented

1. **Password Security**
   - Bcrypt hashing with salt rounds = 10
   - Minimum password length enforcement
   - Password complexity requirements (frontend)

2. **Token Security**
   - JWT tokens with 7-day expiration
   - Tokens stored in localStorage (HTTPS only)
   - Token verification on every protected route

3. **Input Sanitization**
   - Mongoose schema validation
   - File type and size restrictions
   - Email validation and normalization

4. **CORS Configuration**
   ```javascript
   app.use(cors({
     origin: process.env.FRONTEND_URL || 'http://localhost:3000',
     credentials: true
   }));
   ```

5. **Environment Variables**
   - Sensitive data in `.env` file
   - `.env` excluded from version control
   - Different configs for dev/prod

## Scalability Considerations

### Horizontal Scaling Strategy

```
                    ┌─────────────┐
                    │Load Balancer│
                    │   (Nginx)   │
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐       ┌─────▼────┐      ┌─────▼────┐
   │Frontend │       │Frontend  │      │Frontend  │
   │Instance │       │Instance  │      │Instance  │
   │  :3000  │       │  :3001   │      │  :3002   │
   └─────────┘       └──────────┘      └──────────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                    ┌──────▼──────┐
                    │Load Balancer│
                    │   (Nginx)   │
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐       ┌─────▼────┐      ┌─────▼────┐
   │Backend  │       │Backend   │      │Backend   │
   │Instance │       │Instance  │      │Instance  │
   │  :5000  │       │  :5001   │      │  :5002   │
   └─────────┘       └──────────┘      └──────────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                    ┌──────▼──────┐
                    │   MongoDB   │
                    │   Cluster   │
                    │   (Replica  │
                    │     Set)    │
                    └─────────────┘
```

### Performance Optimization

1. **Database Optimization**
   - Proper indexing on frequently queried fields
   - Query optimization with projection
   - Connection pooling
   - Pagination for large datasets

2. **Caching Strategy**
   ```javascript
   // Future: Redis caching
   const redis = require('redis');
   const client = redis.createClient();
   
   // Cache frequently accessed data
   app.get('/api/dashboard/stats', async (req, res) => {
     const cacheKey = `stats:${req.user.userId}`;
     
     // Check cache first
     const cached = await client.get(cacheKey);
     if (cached) {
       return res.json(JSON.parse(cached));
     }
     
     // Query database
     const stats = await calculateStats(req.user.userId);
     
     // Store in cache (5 minutes)
     await client.setex(cacheKey, 300, JSON.stringify(stats));
     
     res.json(stats);
   });
   ```

3. **Asset Optimization**
   - Image compression and lazy loading
   - Code splitting in Next.js
   - Static asset caching
   - CDN for static files

4. **API Optimization**
   - Response compression (gzip)
   - Efficient pagination
   - Field selection in queries
   - Batch operations

## Deployment Architecture

### Production Deployment

```
┌────────────────────────────────────────────────────────┐
│                     Internet                            │
└───────────────────────┬────────────────────────────────┘
                        │
                ┌───────▼────────┐
                │   CloudFlare   │
                │      CDN       │
                └───────┬────────┘
                        │
                ┌───────▼────────┐
                │  Load Balancer │
                │   (AWS ELB)    │
                └───────┬────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
┌───────▼────────┐              ┌───────▼────────┐
│   Frontend     │              │    Backend     │
│   (Vercel)     │              │   (Railway)    │
│   - Next.js    │              │   - Express    │
│   - Auto Scale │              │   - Auto Scale │
└────────────────┘              └───────┬────────┘
                                        │
                                ┌───────▼────────┐
                                │    MongoDB     │
                                │    Atlas       │
                                │  (Replica Set) │
                                └───────┬────────┘
                                        │
                                ┌───────▼────────┐
                                │    AWS S3      │
                                │  (File Storage)│
                                └────────────────┘
```

### Environment Configuration

| Environment | Frontend | Backend | Database | Storage |
|-------------|----------|---------|----------|---------|
| Development | localhost:3000 | localhost:5000 | localhost:27017 | Local FS |
| Staging | staging.myntra.com | api-staging.myntra.com | MongoDB Atlas | AWS S3 |
| Production | myntra.com | api.myntra.com | MongoDB Atlas | AWS S3 |

### Health Checks

```javascript
// Backend health check endpoint
app.get('/api/health', async (req, res) => {
  const health = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    status: 'OK',
    database: 'disconnected',
    memory: process.memoryUsage(),
    version: process.env.npm_package_version
  };
  
  try {
    await mongoose.connection.db.admin().ping();
    health.database = 'connected';
  } catch (error) {
    health.database = 'disconnected';
    health.status = 'ERROR';
  }
  
  const httpCode = health.status === 'OK' ? 200 : 503;
  res.status(httpCode).json(health);
});
```

## Monitoring & Logging

### Logging Strategy

```javascript
// Winston logger configuration (future)
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Usage
logger.info('User logged in', { userId: user._id, email: user.email });
logger.error('Database connection failed', { error: err.message });
```

### Metrics to Monitor

1. **Application Metrics**
   - Request/response times
   - Error rates
   - API endpoint usage
   - User authentication success/failure

2. **System Metrics**
   - CPU usage
   - Memory usage
   - Disk I/O
   - Network throughput

3. **Business Metrics**
   - User registrations
   - Onboarding completion rates
   - Document verification times
   - Training completion rates

---

For more information, refer to other documentation:
- [API Documentation](./API_DOCUMENTATION.md)
- [Developer Guide](./DEVELOPER_GUIDE.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
