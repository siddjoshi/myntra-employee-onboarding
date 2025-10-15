# API Documentation

## Table of Contents
- [Overview](#overview)
- [Authentication](#authentication)
- [Authentication Endpoints](#authentication-endpoints)
- [User Endpoints](#user-endpoints)
- [Task Endpoints](#task-endpoints)
- [Document Endpoints](#document-endpoints)
- [Training Endpoints](#training-endpoints)
- [Dashboard Endpoints](#dashboard-endpoints)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

## Overview

The Myntra Employee Onboarding API is a RESTful API built with Express.js. All endpoints are prefixed with `/api` and return JSON responses.

**Base URL**: `http://localhost:5000/api` (development)

**Content-Type**: `application/json` (except file uploads which use `multipart/form-data`)

## Authentication

The API uses JWT (JSON Web Token) based authentication. After successful login or registration, you'll receive a JWT token that must be included in subsequent requests.

### Including the Token

Include the JWT token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

### Token Expiration

Tokens expire after 7 days. After expiration, users must log in again.

## Authentication Endpoints

### POST /api/auth/register

Register a new user account.

**Authentication**: Not required

**Request Body**:
```json
{
  "email": "john.doe@myntra.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "department": "Engineering",
  "designation": "Software Engineer",
  "joiningDate": "2025-11-01",
  "role": "new_hire"
}
```

**Response** (201 Created):
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "john.doe@myntra.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "new_hire",
    "department": "Engineering",
    "designation": "Software Engineer",
    "employeeId": "MYN123456",
    "onboardingProgress": 0,
    "onboardingStatus": "pending"
  }
}
```

**Error Responses**:
- `400 Bad Request`: User already exists or invalid data
- `500 Internal Server Error`: Server error

---

### POST /api/auth/login

Authenticate and receive a JWT token.

**Authentication**: Not required

**Request Body**:
```json
{
  "email": "john.doe@myntra.com",
  "password": "SecurePassword123!"
}
```

**Response** (200 OK):
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "john.doe@myntra.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "new_hire",
    "department": "Engineering",
    "designation": "Software Engineer",
    "employeeId": "MYN123456",
    "onboardingProgress": 0,
    "onboardingStatus": "pending",
    "manager": {
      "_id": "507f1f77bcf86cd799439012",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane.smith@myntra.com"
    },
    "buddy": {
      "_id": "507f1f77bcf86cd799439013",
      "firstName": "Bob",
      "lastName": "Johnson",
      "email": "bob.johnson@myntra.com"
    }
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid credentials
- `500 Internal Server Error`: Server error

---

### GET /api/auth/me

Get current authenticated user's profile.

**Authentication**: Required

**Response** (200 OK):
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "email": "john.doe@myntra.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "new_hire",
  "department": "Engineering",
  "designation": "Software Engineer",
  "employeeId": "MYN123456",
  "phone": "+91-9876543210",
  "address": "123 Main St, Bangalore",
  "emergencyContact": {
    "name": "Jane Doe",
    "relationship": "Spouse",
    "phone": "+91-9876543211"
  },
  "onboardingProgress": 45,
  "onboardingStatus": "in_progress",
  "manager": {
    "_id": "507f1f77bcf86cd799439012",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@myntra.com"
  },
  "buddy": {
    "_id": "507f1f77bcf86cd799439013",
    "firstName": "Bob",
    "lastName": "Johnson",
    "email": "bob.johnson@myntra.com"
  },
  "createdAt": "2025-10-01T10:00:00.000Z",
  "updatedAt": "2025-10-15T10:00:00.000Z"
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: User not found
- `500 Internal Server Error`: Server error

---

## User Endpoints

### PATCH /api/auth/profile

Update user profile information.

**Authentication**: Required

**Request Body**:
```json
{
  "phone": "+91-9876543210",
  "address": "123 Main St, Bangalore",
  "emergencyContact": {
    "name": "Jane Doe",
    "relationship": "Spouse",
    "phone": "+91-9876543211"
  }
}
```

**Response** (200 OK):
```json
{
  "message": "Profile updated successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "john.doe@myntra.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+91-9876543210",
    "address": "123 Main St, Bangalore",
    "emergencyContact": {
      "name": "Jane Doe",
      "relationship": "Spouse",
      "phone": "+91-9876543211"
    }
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing token
- `500 Internal Server Error`: Server error

---

### GET /api/auth/users

Get all users (HR Admin and Manager only).

**Authentication**: Required (HR Admin or Manager role)

**Query Parameters**:
- `role` (optional): Filter by role (new_hire, hr_admin, manager, buddy)
- `department` (optional): Filter by department
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response** (200 OK):
```json
{
  "users": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "email": "john.doe@myntra.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "new_hire",
      "department": "Engineering",
      "designation": "Software Engineer",
      "employeeId": "MYN123456",
      "onboardingProgress": 45,
      "onboardingStatus": "in_progress",
      "joiningDate": "2025-11-01T00:00:00.000Z"
    }
  ],
  "total": 50,
  "page": 1,
  "pages": 5
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: Insufficient permissions
- `500 Internal Server Error`: Server error

---

### PATCH /api/auth/users/:userId/assign

Assign manager or buddy to a user (HR Admin only).

**Authentication**: Required (HR Admin role)

**Request Body**:
```json
{
  "managerId": "507f1f77bcf86cd799439012",
  "buddyId": "507f1f77bcf86cd799439013"
}
```

**Response** (200 OK):
```json
{
  "message": "Assignments updated successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "john.doe@myntra.com",
    "firstName": "John",
    "lastName": "Doe",
    "manager": {
      "_id": "507f1f77bcf86cd799439012",
      "firstName": "Jane",
      "lastName": "Smith"
    },
    "buddy": {
      "_id": "507f1f77bcf86cd799439013",
      "firstName": "Bob",
      "lastName": "Johnson"
    }
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: User, manager, or buddy not found
- `500 Internal Server Error`: Server error

---

## Task Endpoints

### GET /api/tasks

Get tasks for the authenticated user.

**Authentication**: Required

**Query Parameters**:
- `status` (optional): Filter by status (pending, in_progress, completed, blocked)
- `category` (optional): Filter by category (pre_joining, day_1, week_1, month_1, training, documentation, it_setup, hr_formalities)
- `priority` (optional): Filter by priority (low, medium, high, critical)

**Response** (200 OK):
```json
{
  "tasks": [
    {
      "_id": "507f1f77bcf86cd799439020",
      "title": "Complete IT Setup",
      "description": "Set up laptop, email, and access to necessary systems",
      "category": "it_setup",
      "priority": "high",
      "status": "pending",
      "dueDate": "2025-11-05T00:00:00.000Z",
      "isCompleted": false,
      "order": 1,
      "assignedTo": "507f1f77bcf86cd799439011",
      "assignedBy": {
        "_id": "507f1f77bcf86cd799439012",
        "firstName": "Jane",
        "lastName": "Smith"
      },
      "dependencies": [],
      "attachments": [],
      "createdAt": "2025-10-01T10:00:00.000Z",
      "updatedAt": "2025-10-15T10:00:00.000Z"
    }
  ]
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing token
- `500 Internal Server Error`: Server error

---

### POST /api/tasks

Create a new task (HR Admin or Manager only).

**Authentication**: Required (HR Admin or Manager role)

**Request Body**:
```json
{
  "title": "Complete IT Setup",
  "description": "Set up laptop, email, and access to necessary systems",
  "category": "it_setup",
  "priority": "high",
  "assignedTo": "507f1f77bcf86cd799439011",
  "dueDate": "2025-11-05",
  "order": 1,
  "dependencies": []
}
```

**Response** (201 Created):
```json
{
  "message": "Task created successfully",
  "task": {
    "_id": "507f1f77bcf86cd799439020",
    "title": "Complete IT Setup",
    "description": "Set up laptop, email, and access to necessary systems",
    "category": "it_setup",
    "priority": "high",
    "status": "pending",
    "dueDate": "2025-11-05T00:00:00.000Z",
    "isCompleted": false,
    "order": 1,
    "assignedTo": "507f1f77bcf86cd799439011",
    "assignedBy": "507f1f77bcf86cd799439012",
    "dependencies": [],
    "attachments": [],
    "createdAt": "2025-10-15T10:00:00.000Z",
    "updatedAt": "2025-10-15T10:00:00.000Z"
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: Insufficient permissions
- `400 Bad Request`: Invalid task data
- `500 Internal Server Error`: Server error

---

### GET /api/tasks/:id

Get a specific task by ID.

**Authentication**: Required

**Response** (200 OK):
```json
{
  "_id": "507f1f77bcf86cd799439020",
  "title": "Complete IT Setup",
  "description": "Set up laptop, email, and access to necessary systems",
  "category": "it_setup",
  "priority": "high",
  "status": "pending",
  "dueDate": "2025-11-05T00:00:00.000Z",
  "isCompleted": false,
  "order": 1,
  "assignedTo": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@myntra.com"
  },
  "assignedBy": {
    "_id": "507f1f77bcf86cd799439012",
    "firstName": "Jane",
    "lastName": "Smith"
  },
  "dependencies": [],
  "attachments": [],
  "notes": "",
  "createdAt": "2025-10-01T10:00:00.000Z",
  "updatedAt": "2025-10-15T10:00:00.000Z"
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: Cannot access other users' tasks
- `404 Not Found`: Task not found
- `500 Internal Server Error`: Server error

---

### PATCH /api/tasks/:id/status

Update task status.

**Authentication**: Required

**Request Body**:
```json
{
  "status": "completed",
  "notes": "Setup completed successfully"
}
```

**Response** (200 OK):
```json
{
  "message": "Task status updated successfully",
  "task": {
    "_id": "507f1f77bcf86cd799439020",
    "title": "Complete IT Setup",
    "status": "completed",
    "isCompleted": true,
    "completedAt": "2025-10-15T10:00:00.000Z",
    "notes": "Setup completed successfully"
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: Cannot update other users' tasks
- `404 Not Found`: Task not found
- `400 Bad Request`: Invalid status
- `500 Internal Server Error`: Server error

---

### DELETE /api/tasks/:id

Delete a task (HR Admin only).

**Authentication**: Required (HR Admin role)

**Response** (200 OK):
```json
{
  "message": "Task deleted successfully"
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Task not found
- `500 Internal Server Error`: Server error

---

## Document Endpoints

### GET /api/documents

Get all documents for the authenticated user.

**Authentication**: Required

**Query Parameters**:
- `status` (optional): Filter by status (pending, verified, rejected)
- `documentType` (optional): Filter by document type

**Response** (200 OK):
```json
{
  "documents": [
    {
      "_id": "507f1f77bcf86cd799439030",
      "userId": "507f1f77bcf86cd799439011",
      "documentType": "aadhaar",
      "fileName": "aadhaar-1234567890.pdf",
      "fileUrl": "/uploads/documents/aadhaar-1234567890.pdf",
      "fileSize": 1024000,
      "mimeType": "application/pdf",
      "status": "pending",
      "isRequired": true,
      "uploadedAt": "2025-10-15T10:00:00.000Z"
    }
  ]
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing token
- `500 Internal Server Error`: Server error

---

### POST /api/documents/upload

Upload a document.

**Authentication**: Required

**Content-Type**: `multipart/form-data`

**Request Body** (form-data):
- `document` (file): The document file (max 5MB)
- `documentType` (string): Type of document (aadhaar, pan_card, passport, etc.)
- `isRequired` (boolean): Whether the document is required

**Response** (201 Created):
```json
{
  "message": "Document uploaded successfully",
  "document": {
    "_id": "507f1f77bcf86cd799439030",
    "userId": "507f1f77bcf86cd799439011",
    "documentType": "aadhaar",
    "fileName": "aadhaar-1234567890.pdf",
    "fileUrl": "/uploads/documents/aadhaar-1234567890.pdf",
    "fileSize": 1024000,
    "mimeType": "application/pdf",
    "status": "pending",
    "isRequired": true,
    "uploadedAt": "2025-10-15T10:00:00.000Z"
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing token
- `400 Bad Request`: Invalid file type or size
- `500 Internal Server Error`: Server error

---

### PATCH /api/documents/:id/verify

Verify or reject a document (HR Admin only).

**Authentication**: Required (HR Admin role)

**Request Body**:
```json
{
  "status": "verified",
  "rejectionReason": ""
}
```

or

```json
{
  "status": "rejected",
  "rejectionReason": "Document is not clear, please upload a better quality image"
}
```

**Response** (200 OK):
```json
{
  "message": "Document status updated successfully",
  "document": {
    "_id": "507f1f77bcf86cd799439030",
    "userId": "507f1f77bcf86cd799439011",
    "documentType": "aadhaar",
    "status": "verified",
    "verifiedBy": "507f1f77bcf86cd799439012",
    "verifiedAt": "2025-10-15T11:00:00.000Z"
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Document not found
- `500 Internal Server Error`: Server error

---

### DELETE /api/documents/:id

Delete a document.

**Authentication**: Required

**Response** (200 OK):
```json
{
  "message": "Document deleted successfully"
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: Cannot delete other users' documents
- `404 Not Found`: Document not found
- `500 Internal Server Error`: Server error

---

## Training Endpoints

### GET /api/training

Get all training modules with user progress.

**Authentication**: Required

**Response** (200 OK):
```json
{
  "training": [
    {
      "module": {
        "_id": "507f1f77bcf86cd799439040",
        "title": "Myntra Culture and Values",
        "description": "Learn about Myntra's mission, vision, and core values",
        "category": "company_culture",
        "content": "Welcome to Myntra...",
        "duration": 30,
        "videoUrl": "https://example.com/video.mp4",
        "quiz": [
          {
            "question": "What is Myntra's mission?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswer": 1
          }
        ],
        "passingScore": 70,
        "isRequired": true,
        "order": 1
      },
      "progress": {
        "_id": "507f1f77bcf86cd799439041",
        "userId": "507f1f77bcf86cd799439011",
        "moduleId": "507f1f77bcf86cd799439040",
        "status": "in_progress",
        "progress": 50,
        "quizScore": 0,
        "quizAttempts": 0,
        "startedAt": "2025-10-15T10:00:00.000Z"
      }
    }
  ]
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing token
- `500 Internal Server Error`: Server error

---

### GET /api/training/:id

Get a specific training module.

**Authentication**: Required

**Response** (200 OK):
```json
{
  "module": {
    "_id": "507f1f77bcf86cd799439040",
    "title": "Myntra Culture and Values",
    "description": "Learn about Myntra's mission, vision, and core values",
    "category": "company_culture",
    "content": "Welcome to Myntra...",
    "duration": 30,
    "videoUrl": "https://example.com/video.mp4",
    "presentationUrl": "https://example.com/presentation.pdf",
    "resources": [
      {
        "title": "Employee Handbook",
        "url": "https://example.com/handbook.pdf",
        "type": "pdf"
      }
    ],
    "quiz": [
      {
        "question": "What is Myntra's mission?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": 1
      }
    ],
    "passingScore": 70,
    "isRequired": true,
    "order": 1,
    "createdBy": "507f1f77bcf86cd799439012",
    "createdAt": "2025-10-01T10:00:00.000Z"
  },
  "progress": {
    "_id": "507f1f77bcf86cd799439041",
    "userId": "507f1f77bcf86cd799439011",
    "moduleId": "507f1f77bcf86cd799439040",
    "status": "in_progress",
    "progress": 50,
    "quizScore": 0,
    "quizAttempts": 0,
    "startedAt": "2025-10-15T10:00:00.000Z",
    "lastAccessedAt": "2025-10-15T12:00:00.000Z"
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: Training module not found
- `500 Internal Server Error`: Server error

---

### POST /api/training/:id/progress

Update training progress.

**Authentication**: Required

**Request Body**:
```json
{
  "progress": 75,
  "status": "in_progress"
}
```

**Response** (200 OK):
```json
{
  "message": "Progress updated successfully",
  "progress": {
    "_id": "507f1f77bcf86cd799439041",
    "userId": "507f1f77bcf86cd799439011",
    "moduleId": "507f1f77bcf86cd799439040",
    "status": "in_progress",
    "progress": 75,
    "lastAccessedAt": "2025-10-15T13:00:00.000Z"
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: Training module not found
- `500 Internal Server Error`: Server error

---

### POST /api/training/:id/quiz

Submit quiz answers.

**Authentication**: Required

**Request Body**:
```json
{
  "answers": [1, 2, 0, 3]
}
```

**Response** (200 OK):
```json
{
  "message": "Quiz submitted successfully",
  "score": 85,
  "passed": true,
  "progress": {
    "_id": "507f1f77bcf86cd799439041",
    "userId": "507f1f77bcf86cd799439011",
    "moduleId": "507f1f77bcf86cd799439040",
    "status": "completed",
    "progress": 100,
    "quizScore": 85,
    "quizAttempts": 1,
    "completedAt": "2025-10-15T14:00:00.000Z"
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: Training module not found
- `400 Bad Request`: Invalid quiz answers
- `500 Internal Server Error`: Server error

---

### POST /api/training/modules

Create a new training module (HR Admin only).

**Authentication**: Required (HR Admin role)

**Request Body**:
```json
{
  "title": "Product Knowledge",
  "description": "Learn about Myntra's products and services",
  "category": "product_knowledge",
  "content": "Myntra offers...",
  "duration": 45,
  "videoUrl": "https://example.com/video.mp4",
  "presentationUrl": "https://example.com/presentation.pdf",
  "resources": [
    {
      "title": "Product Catalog",
      "url": "https://example.com/catalog.pdf",
      "type": "pdf"
    }
  ],
  "quiz": [
    {
      "question": "How many product categories does Myntra have?",
      "options": ["5", "10", "15", "20"],
      "correctAnswer": 2
    }
  ],
  "passingScore": 70,
  "isRequired": true,
  "order": 2
}
```

**Response** (201 Created):
```json
{
  "message": "Training module created successfully",
  "module": {
    "_id": "507f1f77bcf86cd799439042",
    "title": "Product Knowledge",
    "description": "Learn about Myntra's products and services",
    "category": "product_knowledge",
    "createdBy": "507f1f77bcf86cd799439012",
    "createdAt": "2025-10-15T15:00:00.000Z"
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: Insufficient permissions
- `400 Bad Request`: Invalid module data
- `500 Internal Server Error`: Server error

---

## Dashboard Endpoints

### GET /api/dashboard/stats

Get dashboard statistics for the authenticated user.

**Authentication**: Required

**Response** (200 OK):

For New Hire:
```json
{
  "onboardingProgress": 45,
  "onboardingStatus": "in_progress",
  "tasksCompleted": 5,
  "totalTasks": 12,
  "documentsVerified": 3,
  "totalDocuments": 8,
  "trainingCompleted": 2,
  "totalTraining": 6,
  "upcomingTasks": [
    {
      "_id": "507f1f77bcf86cd799439020",
      "title": "Complete IT Setup",
      "dueDate": "2025-11-05T00:00:00.000Z",
      "priority": "high"
    }
  ],
  "recentActivities": [
    {
      "type": "task_completed",
      "title": "Sign Offer Letter",
      "timestamp": "2025-10-14T10:00:00.000Z"
    }
  ]
}
```

For HR Admin:
```json
{
  "totalEmployees": 150,
  "activeOnboarding": 25,
  "completedOnboarding": 120,
  "pendingDocuments": 45,
  "averageOnboardingTime": 18,
  "recentHires": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "firstName": "John",
      "lastName": "Doe",
      "department": "Engineering",
      "joiningDate": "2025-11-01T00:00:00.000Z",
      "onboardingProgress": 45
    }
  ],
  "departmentStats": [
    {
      "department": "Engineering",
      "activeEmployees": 10,
      "averageProgress": 55
    }
  ]
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing token
- `500 Internal Server Error`: Server error

---

### GET /api/dashboard/new-hires

Get all new hires (HR Admin or Manager only).

**Authentication**: Required (HR Admin or Manager role)

**Query Parameters**:
- `department` (optional): Filter by department
- `status` (optional): Filter by onboarding status
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response** (200 OK):
```json
{
  "newHires": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@myntra.com",
      "department": "Engineering",
      "designation": "Software Engineer",
      "employeeId": "MYN123456",
      "joiningDate": "2025-11-01T00:00:00.000Z",
      "onboardingProgress": 45,
      "onboardingStatus": "in_progress",
      "tasksCompleted": 5,
      "totalTasks": 12,
      "documentsVerified": 3,
      "totalDocuments": 8,
      "manager": {
        "_id": "507f1f77bcf86cd799439012",
        "firstName": "Jane",
        "lastName": "Smith"
      },
      "buddy": {
        "_id": "507f1f77bcf86cd799439013",
        "firstName": "Bob",
        "lastName": "Johnson"
      }
    }
  ],
  "total": 25,
  "page": 1,
  "pages": 3
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: Insufficient permissions
- `500 Internal Server Error`: Server error

---

### GET /api/dashboard/hr-stats

Get HR admin statistics.

**Authentication**: Required (HR Admin role)

**Response** (200 OK):
```json
{
  "overview": {
    "totalEmployees": 150,
    "activeOnboarding": 25,
    "completedOnboarding": 120,
    "pendingOnboarding": 5
  },
  "documents": {
    "pending": 45,
    "verified": 300,
    "rejected": 12
  },
  "training": {
    "totalModules": 15,
    "averageCompletionRate": 85,
    "totalCompletions": 1200
  },
  "tasks": {
    "pending": 120,
    "inProgress": 80,
    "completed": 450,
    "blocked": 5
  },
  "departmentBreakdown": [
    {
      "department": "Engineering",
      "totalEmployees": 50,
      "activeOnboarding": 8,
      "averageProgress": 65,
      "averageOnboardingTime": 16
    },
    {
      "department": "Marketing",
      "totalEmployees": 30,
      "activeOnboarding": 5,
      "averageProgress": 70,
      "averageOnboardingTime": 14
    }
  ],
  "trends": {
    "monthlyHires": [
      { "month": "2025-10", "count": 12 },
      { "month": "2025-09", "count": 15 },
      { "month": "2025-08", "count": 10 }
    ],
    "completionRates": [
      { "month": "2025-10", "rate": 88 },
      { "month": "2025-09", "rate": 92 },
      { "month": "2025-08", "rate": 85 }
    ]
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: Insufficient permissions
- `500 Internal Server Error`: Server error

---

## Error Handling

All API endpoints follow consistent error response patterns:

### Error Response Format

```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common HTTP Status Codes

- `200 OK`: Successful GET request
- `201 Created`: Successful POST request (resource created)
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: Insufficient permissions for the operation
- `404 Not Found`: Requested resource not found
- `409 Conflict`: Resource conflict (e.g., duplicate email)
- `422 Unprocessable Entity`: Validation error
- `500 Internal Server Error`: Server-side error

### Example Error Responses

**401 Unauthorized**:
```json
{
  "error": "No token provided, authorization denied"
}
```

**403 Forbidden**:
```json
{
  "error": "You do not have permission to perform this action"
}
```

**404 Not Found**:
```json
{
  "error": "Task not found"
}
```

**400 Bad Request**:
```json
{
  "error": "User already exists with this email."
}
```

**500 Internal Server Error**:
```json
{
  "error": "An unexpected error occurred. Please try again later."
}
```

---

## Rate Limiting

To protect the API from abuse, rate limiting is implemented:

- **Anonymous requests**: 100 requests per 15 minutes
- **Authenticated requests**: 1000 requests per 15 minutes
- **File uploads**: 10 requests per 15 minutes

When rate limit is exceeded, the API returns:

```json
{
  "error": "Too many requests, please try again later",
  "retryAfter": 900
}
```

HTTP Status Code: `429 Too Many Requests`

---

## Best Practices

### 1. Always Include Authorization Header

```javascript
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};
```

### 2. Handle Errors Gracefully

```javascript
try {
  const response = await axios.get('/api/tasks');
  // Handle success
} catch (error) {
  if (error.response) {
    // Server responded with error status
    console.error(error.response.data.error);
  } else if (error.request) {
    // Request made but no response
    console.error('Network error');
  } else {
    // Something else happened
    console.error('Error', error.message);
  }
}
```

### 3. Use Query Parameters for Filtering

```javascript
// GET /api/tasks?status=pending&category=day_1
const response = await axios.get('/api/tasks', {
  params: {
    status: 'pending',
    category: 'day_1'
  }
});
```

### 4. File Upload Example

```javascript
const formData = new FormData();
formData.append('document', fileInput.files[0]);
formData.append('documentType', 'aadhaar');
formData.append('isRequired', 'true');

const response = await axios.post('/api/documents/upload', formData, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'multipart/form-data'
  }
});
```

---

## Changelog

### Version 1.0.0 (2025-10-15)
- Initial API documentation
- Authentication endpoints
- User management endpoints
- Task management endpoints
- Document management endpoints
- Training management endpoints
- Dashboard and analytics endpoints

---

For more information, visit the [GitHub repository](https://github.com/siddjoshi/myntra-employee-onboarding) or contact the development team.
