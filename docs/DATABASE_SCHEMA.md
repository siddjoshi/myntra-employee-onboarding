# Database Schema Documentation

## Table of Contents
- [Overview](#overview)
- [Collections](#collections)
- [Indexes](#indexes)
- [Relationships](#relationships)
- [Data Types](#data-types)
- [Validation Rules](#validation-rules)
- [Query Examples](#query-examples)

## Overview

The Myntra Employee Onboarding System uses MongoDB as its database. MongoDB is a NoSQL document-oriented database that stores data in flexible, JSON-like documents.

### Database Name
```
myntra-onboarding
```

### Collections
- `users` - User accounts and profiles
- `tasks` - Onboarding tasks
- `documents` - Uploaded documents
- `trainingmodules` - Training content
- `trainingprogresses` - User training progress

## Collections

### Users Collection

Stores user accounts, profiles, and authentication information.

**Collection Name**: `users`

**Schema**:
```javascript
{
  _id: ObjectId,                    // Unique identifier (auto-generated)
  email: String,                    // User's email (unique, lowercase)
  password: String,                 // Hashed password (bcrypt)
  firstName: String,                // User's first name
  lastName: String,                 // User's last name
  role: String,                     // User role (enum)
  department: String,               // Department name
  designation: String,              // Job title
  joiningDate: Date,                // Official start date
  employeeId: String,               // Generated employee ID (unique)
  phone: String,                    // Phone number (optional)
  address: String,                  // Physical address (optional)
  emergencyContact: {               // Emergency contact info
    name: String,
    relationship: String,
    phone: String
  },
  manager: ObjectId,                // Reference to User (manager)
  buddy: ObjectId,                  // Reference to User (buddy mentor)
  profilePicture: String,           // URL to profile image
  onboardingStatus: String,         // Status enum
  onboardingProgress: Number,       // Progress percentage (0-100)
  createdAt: Date,                  // Account creation timestamp
  updatedAt: Date                   // Last update timestamp
}
```

**Field Details**:

| Field | Type | Required | Unique | Default | Description |
|-------|------|----------|--------|---------|-------------|
| email | String | ✅ | ✅ | - | User's email address, lowercased and trimmed |
| password | String | ✅ | ❌ | - | Bcrypt hashed password (never plain text) |
| firstName | String | ✅ | ❌ | - | User's first name |
| lastName | String | ✅ | ❌ | - | User's last name |
| role | String | ✅ | ❌ | 'new_hire' | One of: new_hire, hr_admin, manager, buddy |
| department | String | ✅ | ❌ | - | Department name (e.g., Engineering, Marketing) |
| designation | String | ✅ | ❌ | - | Job title (e.g., Software Engineer, Product Manager) |
| joiningDate | Date | ✅ | ❌ | - | Official start date |
| employeeId | String | ❌ | ✅ | Auto-generated | Format: MYN{timestamp-last-6-digits} |
| phone | String | ❌ | ❌ | - | Contact phone number |
| address | String | ❌ | ❌ | - | Physical address |
| emergencyContact | Object | ❌ | ❌ | - | Emergency contact information |
| manager | ObjectId | ❌ | ❌ | - | Reference to manager (User._id) |
| buddy | ObjectId | ❌ | ❌ | - | Reference to buddy mentor (User._id) |
| profilePicture | String | ❌ | ❌ | - | URL or path to profile picture |
| onboardingStatus | String | ❌ | ❌ | 'pending' | One of: pending, in_progress, completed |
| onboardingProgress | Number | ❌ | ❌ | 0 | Percentage (0-100) |
| createdAt | Date | ❌ | ❌ | Auto | Timestamp of document creation |
| updatedAt | Date | ❌ | ❌ | Auto | Timestamp of last update |

**Example Document**:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "email": "john.doe@myntra.com",
  "password": "$2a$10$N9qo8uLOickgx2ZMRZoMye.../hashed",
  "firstName": "John",
  "lastName": "Doe",
  "role": "new_hire",
  "department": "Engineering",
  "designation": "Software Engineer",
  "joiningDate": "2025-11-01T00:00:00.000Z",
  "employeeId": "MYN123456",
  "phone": "+91-9876543210",
  "address": "123 Main St, Bangalore, Karnataka, India",
  "emergencyContact": {
    "name": "Jane Doe",
    "relationship": "Spouse",
    "phone": "+91-9876543211"
  },
  "manager": "507f1f77bcf86cd799439012",
  "buddy": "507f1f77bcf86cd799439013",
  "profilePicture": "/uploads/profiles/profile-1697376000-123456.jpg",
  "onboardingStatus": "in_progress",
  "onboardingProgress": 45,
  "createdAt": "2025-10-15T10:00:00.000Z",
  "updatedAt": "2025-10-20T15:30:00.000Z"
}
```

---

### Tasks Collection

Stores onboarding tasks assigned to users.

**Collection Name**: `tasks`

**Schema**:
```javascript
{
  _id: ObjectId,                    // Unique identifier
  title: String,                    // Task title
  description: String,              // Task description
  category: String,                 // Task category (enum)
  priority: String,                 // Priority level (enum)
  assignedTo: ObjectId,             // Reference to User
  assignedBy: ObjectId,             // Reference to User (creator)
  status: String,                   // Task status (enum)
  dueDate: Date,                    // Due date
  completedAt: Date,                // Completion timestamp
  isCompleted: Boolean,             // Completion flag
  order: Number,                    // Display order
  dependencies: [ObjectId],         // Array of Task references
  attachments: [{                   // Array of attachments
    fileName: String,
    fileUrl: String,
    uploadedAt: Date
  }],
  notes: String,                    // Additional notes
  createdAt: Date,                  // Creation timestamp
  updatedAt: Date                   // Last update timestamp
}
```

**Field Details**:

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| title | String | ✅ | - | Task title (trimmed) |
| description | String | ✅ | - | Detailed task description |
| category | String | ✅ | - | One of: pre_joining, day_1, week_1, month_1, training, documentation, it_setup, hr_formalities |
| priority | String | ❌ | 'medium' | One of: low, medium, high, critical |
| assignedTo | ObjectId | ✅ | - | User who must complete the task |
| assignedBy | ObjectId | ❌ | - | User who created/assigned the task |
| status | String | ❌ | 'pending' | One of: pending, in_progress, completed, blocked |
| dueDate | Date | ✅ | - | Task deadline |
| completedAt | Date | ❌ | - | When task was completed |
| isCompleted | Boolean | ❌ | false | Completion flag |
| order | Number | ❌ | 0 | Display/execution order |
| dependencies | Array | ❌ | [] | Tasks that must be completed first |
| attachments | Array | ❌ | [] | Files attached to task |
| notes | String | ❌ | - | Additional notes or comments |
| createdAt | Date | ❌ | Auto | Creation timestamp |
| updatedAt | Date | ❌ | Auto | Last update timestamp |

**Example Document**:
```json
{
  "_id": "507f1f77bcf86cd799439020",
  "title": "Complete IT Setup",
  "description": "Set up laptop, email account, VPN access, and development tools",
  "category": "it_setup",
  "priority": "high",
  "assignedTo": "507f1f77bcf86cd799439011",
  "assignedBy": "507f1f77bcf86cd799439012",
  "status": "in_progress",
  "dueDate": "2025-11-05T00:00:00.000Z",
  "completedAt": null,
  "isCompleted": false,
  "order": 1,
  "dependencies": [],
  "attachments": [
    {
      "fileName": "it-setup-guide.pdf",
      "fileUrl": "/uploads/tasks/it-setup-guide.pdf",
      "uploadedAt": "2025-10-15T10:00:00.000Z"
    }
  ],
  "notes": "Contact IT support at ext. 1234 for help",
  "createdAt": "2025-10-15T10:00:00.000Z",
  "updatedAt": "2025-10-18T14:20:00.000Z"
}
```

---

### Documents Collection

Stores information about uploaded documents.

**Collection Name**: `documents`

**Schema**:
```javascript
{
  _id: ObjectId,                    // Unique identifier
  userId: ObjectId,                 // Reference to User
  documentType: String,             // Document type (enum)
  fileName: String,                 // Original filename
  fileUrl: String,                  // Path or URL to file
  fileSize: Number,                 // File size in bytes
  mimeType: String,                 // MIME type
  status: String,                   // Verification status (enum)
  verifiedBy: ObjectId,             // Reference to User (HR admin)
  verifiedAt: Date,                 // Verification timestamp
  rejectionReason: String,          // Reason if rejected
  uploadedAt: Date,                 // Upload timestamp
  expiryDate: Date,                 // Document expiry (optional)
  isRequired: Boolean               // Whether document is mandatory
}
```

**Field Details**:

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| userId | ObjectId | ✅ | - | User who uploaded the document |
| documentType | String | ✅ | - | One of: aadhaar, pan_card, passport, offer_letter, educational_certificates, experience_letters, address_proof, bank_details, photo, other |
| fileName | String | ✅ | - | Original filename |
| fileUrl | String | ✅ | - | Path or URL to stored file |
| fileSize | Number | ❌ | - | File size in bytes |
| mimeType | String | ❌ | - | MIME type (e.g., application/pdf) |
| status | String | ❌ | 'pending' | One of: pending, verified, rejected |
| verifiedBy | ObjectId | ❌ | - | HR admin who verified |
| verifiedAt | Date | ❌ | - | When document was verified |
| rejectionReason | String | ❌ | - | Reason for rejection |
| uploadedAt | Date | ❌ | Auto | Upload timestamp |
| expiryDate | Date | ❌ | - | Document expiration date |
| isRequired | Boolean | ❌ | true | Whether document is mandatory |

**Example Document**:
```json
{
  "_id": "507f1f77bcf86cd799439030",
  "userId": "507f1f77bcf86cd799439011",
  "documentType": "aadhaar",
  "fileName": "aadhaar-card.pdf",
  "fileUrl": "/uploads/documents/aadhaar-1697376000-123456.pdf",
  "fileSize": 1024000,
  "mimeType": "application/pdf",
  "status": "verified",
  "verifiedBy": "507f1f77bcf86cd799439012",
  "verifiedAt": "2025-10-16T11:30:00.000Z",
  "rejectionReason": null,
  "uploadedAt": "2025-10-15T10:00:00.000Z",
  "expiryDate": null,
  "isRequired": true
}
```

---

### Training Modules Collection

Stores training content and quizzes.

**Collection Name**: `trainingmodules`

**Schema**:
```javascript
{
  _id: ObjectId,                    // Unique identifier
  title: String,                    // Module title
  description: String,              // Module description
  category: String,                 // Category (enum)
  content: String,                  // Training content (text/HTML)
  duration: Number,                 // Duration in minutes
  videoUrl: String,                 // URL to training video
  presentationUrl: String,          // URL to presentation
  resources: [{                     // Additional resources
    title: String,
    url: String,
    type: String
  }],
  quiz: [{                          // Quiz questions
    question: String,
    options: [String],              // Array of 4 options
    correctAnswer: Number           // Index of correct answer (0-3)
  }],
  passingScore: Number,             // Minimum score to pass (%)
  isRequired: Boolean,              // Whether module is mandatory
  order: Number,                    // Display order
  createdBy: ObjectId,              // Reference to User (creator)
  createdAt: Date,                  // Creation timestamp
  updatedAt: Date                   // Last update timestamp
}
```

**Field Details**:

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| title | String | ✅ | - | Training module title |
| description | String | ✅ | - | Brief description |
| category | String | ✅ | - | One of: company_culture, product_knowledge, compliance, technical, soft_skills, department_specific |
| content | String | ✅ | - | Main training content |
| duration | Number | ❌ | - | Estimated duration in minutes |
| videoUrl | String | ❌ | - | Link to training video |
| presentationUrl | String | ❌ | - | Link to presentation slides |
| resources | Array | ❌ | [] | Additional learning resources |
| quiz | Array | ❌ | [] | Assessment questions |
| passingScore | Number | ❌ | 70 | Passing percentage (0-100) |
| isRequired | Boolean | ❌ | true | Whether completion is mandatory |
| order | Number | ❌ | 0 | Display order |
| createdBy | ObjectId | ❌ | - | User who created the module |
| createdAt | Date | ❌ | Auto | Creation timestamp |
| updatedAt | Date | ❌ | Auto | Last update timestamp |

**Example Document**:
```json
{
  "_id": "507f1f77bcf86cd799439040",
  "title": "Myntra Culture and Values",
  "description": "Learn about Myntra's mission, vision, and core values",
  "category": "company_culture",
  "content": "Welcome to Myntra! Our mission is to...",
  "duration": 30,
  "videoUrl": "https://example.com/videos/myntra-culture.mp4",
  "presentationUrl": "https://example.com/presentations/culture.pdf",
  "resources": [
    {
      "title": "Employee Handbook",
      "url": "https://example.com/handbook.pdf",
      "type": "pdf"
    }
  ],
  "quiz": [
    {
      "question": "What is Myntra's primary mission?",
      "options": [
        "To sell clothes online",
        "To make fashion accessible to everyone",
        "To compete with Amazon",
        "To open physical stores"
      ],
      "correctAnswer": 1
    }
  ],
  "passingScore": 70,
  "isRequired": true,
  "order": 1,
  "createdBy": "507f1f77bcf86cd799439012",
  "createdAt": "2025-10-01T10:00:00.000Z",
  "updatedAt": "2025-10-15T10:00:00.000Z"
}
```

---

### Training Progress Collection

Tracks individual user progress through training modules.

**Collection Name**: `trainingprogresses`

**Schema**:
```javascript
{
  _id: ObjectId,                    // Unique identifier
  userId: ObjectId,                 // Reference to User
  moduleId: ObjectId,               // Reference to TrainingModule
  status: String,                   // Progress status (enum)
  progress: Number,                 // Progress percentage (0-100)
  quizScore: Number,                // Latest quiz score
  quizAttempts: Number,             // Number of quiz attempts
  startedAt: Date,                  // When user started module
  completedAt: Date,                // When user completed module
  lastAccessedAt: Date              // Last time user accessed module
}
```

**Field Details**:

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| userId | ObjectId | ✅ | - | User taking the training |
| moduleId | ObjectId | ✅ | - | Training module reference |
| status | String | ❌ | 'not_started' | One of: not_started, in_progress, completed |
| progress | Number | ❌ | 0 | Progress percentage (0-100) |
| quizScore | Number | ❌ | 0 | Latest quiz score percentage |
| quizAttempts | Number | ❌ | 0 | Number of times quiz was attempted |
| startedAt | Date | ❌ | - | When training was started |
| completedAt | Date | ❌ | - | When training was completed |
| lastAccessedAt | Date | ❌ | Auto | Last access timestamp |

**Unique Constraint**: `userId` + `moduleId` (one progress record per user per module)

**Example Document**:
```json
{
  "_id": "507f1f77bcf86cd799439041",
  "userId": "507f1f77bcf86cd799439011",
  "moduleId": "507f1f77bcf86cd799439040",
  "status": "completed",
  "progress": 100,
  "quizScore": 85,
  "quizAttempts": 2,
  "startedAt": "2025-10-15T10:00:00.000Z",
  "completedAt": "2025-10-18T16:45:00.000Z",
  "lastAccessedAt": "2025-10-18T16:45:00.000Z"
}
```

## Indexes

Indexes improve query performance by allowing the database to quickly locate documents.

### Users Collection Indexes

```javascript
// Unique indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ employeeId: 1 }, { unique: true, sparse: true });

// Query optimization indexes
db.users.createIndex({ role: 1, department: 1 });
db.users.createIndex({ onboardingStatus: 1 });
db.users.createIndex({ manager: 1 });
```

### Tasks Collection Indexes

```javascript
// Query optimization indexes
db.tasks.createIndex({ assignedTo: 1, status: 1 });
db.tasks.createIndex({ dueDate: 1, status: 1 });
db.tasks.createIndex({ category: 1 });
db.tasks.createIndex({ assignedBy: 1 });
```

### Documents Collection Indexes

```javascript
// Query optimization indexes
db.documents.createIndex({ userId: 1, status: 1 });
db.documents.createIndex({ documentType: 1 });
db.documents.createIndex({ status: 1 });
db.documents.createIndex({ uploadedAt: -1 });
```

### Training Progress Collection Indexes

```javascript
// Unique compound index
db.trainingprogresses.createIndex(
  { userId: 1, moduleId: 1 }, 
  { unique: true }
);

// Query optimization indexes
db.trainingprogresses.createIndex({ userId: 1, status: 1 });
db.trainingprogresses.createIndex({ moduleId: 1 });
```

## Relationships

### Entity Relationship Diagram

```
┌─────────────────┐
│      User       │
│   (users)       │
└────────┬────────┘
         │
         │ 1:N (assignedTo)
         │
    ┌────┴────────────────────┐
    │                         │
┌───▼──────┐           ┌──────▼────┐
│  Task    │           │ Document  │
│ (tasks)  │           │(documents)│
└──────────┘           └───────────┘
         │
         │ N:1 (assignedBy)
         │
    ┌────┴────┐
    │  User   │
    └─────────┘

┌──────────────────┐      ┌─────────────────────┐
│ TrainingModule   │ 1:N  │ TrainingProgress    │
│(trainingmodules) │◄─────│(trainingprogresses) │
└──────────────────┘      └──────────┬──────────┘
                                     │ N:1
                          ┌──────────▼─────────┐
                          │       User         │
                          └────────────────────┘
```

### Relationship Descriptions

1. **User → Task** (1:N)
   - One user can have many tasks assigned to them
   - Field: `tasks.assignedTo` → `users._id`

2. **User → Task** (1:N as assigner)
   - One user (HR/Manager) can assign many tasks
   - Field: `tasks.assignedBy` → `users._id`

3. **User → Document** (1:N)
   - One user can upload many documents
   - Field: `documents.userId` → `users._id`

4. **User → User** (Manager)
   - One user can be a manager to many users
   - Field: `users.manager` → `users._id`

5. **User → User** (Buddy)
   - One user can be a buddy to many users
   - Field: `users.buddy` → `users._id`

6. **User → TrainingProgress** (1:N)
   - One user can have progress in many training modules
   - Field: `trainingprogresses.userId` → `users._id`

7. **TrainingModule → TrainingProgress** (1:N)
   - One module can have progress records for many users
   - Field: `trainingprogresses.moduleId` → `trainingmodules._id`

8. **Task → Task** (Dependencies)
   - Tasks can depend on other tasks
   - Field: `tasks.dependencies[]` → `tasks._id`

## Data Types

### MongoDB Data Types Used

| Type | Description | Example |
|------|-------------|---------|
| ObjectId | 12-byte unique identifier | `ObjectId("507f1f77bcf86cd799439011")` |
| String | UTF-8 string | `"John Doe"` |
| Number | Integer or float | `42`, `3.14` |
| Date | ISODate timestamp | `ISODate("2025-10-15T10:00:00.000Z")` |
| Boolean | true/false | `true`, `false` |
| Array | List of values | `["item1", "item2"]` |
| Object | Embedded document | `{ key: "value" }` |

### Enum Values

**User Roles**:
- `new_hire`
- `hr_admin`
- `manager`
- `buddy`

**Onboarding Status**:
- `pending`
- `in_progress`
- `completed`

**Task Categories**:
- `pre_joining`
- `day_1`
- `week_1`
- `month_1`
- `training`
- `documentation`
- `it_setup`
- `hr_formalities`

**Task Priorities**:
- `low`
- `medium`
- `high`
- `critical`

**Task Status**:
- `pending`
- `in_progress`
- `completed`
- `blocked`

**Document Types**:
- `aadhaar`
- `pan_card`
- `passport`
- `offer_letter`
- `educational_certificates`
- `experience_letters`
- `address_proof`
- `bank_details`
- `photo`
- `other`

**Document Status**:
- `pending`
- `verified`
- `rejected`

**Training Categories**:
- `company_culture`
- `product_knowledge`
- `compliance`
- `technical`
- `soft_skills`
- `department_specific`

**Training Progress Status**:
- `not_started`
- `in_progress`
- `completed`

## Validation Rules

### User Validation

```javascript
// Email validation
email: {
  type: String,
  required: true,
  unique: true,
  lowercase: true,
  trim: true,
  validate: {
    validator: function(v) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    },
    message: 'Invalid email format'
  }
}

// Phone validation
phone: {
  type: String,
  validate: {
    validator: function(v) {
      return !v || /^\+?[\d\s\-()]+$/.test(v);
    },
    message: 'Invalid phone number format'
  }
}

// Progress validation
onboardingProgress: {
  type: Number,
  min: 0,
  max: 100,
  default: 0
}
```

### Task Validation

```javascript
// Due date validation
dueDate: {
  type: Date,
  required: true,
  validate: {
    validator: function(v) {
      return v instanceof Date && !isNaN(v);
    },
    message: 'Invalid date'
  }
}

// Order validation
order: {
  type: Number,
  min: 0,
  default: 0
}
```

## Query Examples

### Common Queries

**Find user by email**:
```javascript
const user = await User.findOne({ email: 'john.doe@myntra.com' });
```

**Find all tasks for a user**:
```javascript
const tasks = await Task.find({ assignedTo: userId })
  .populate('assignedBy', 'firstName lastName email')
  .sort({ dueDate: 1, priority: -1 });
```

**Find pending documents**:
```javascript
const pendingDocs = await Document.find({ 
  userId: userId,
  status: 'pending' 
});
```

**Get user's training progress**:
```javascript
const progress = await TrainingProgress.find({ userId })
  .populate('moduleId', 'title category duration');
```

**Calculate onboarding progress**:
```javascript
const totalTasks = await Task.countDocuments({ assignedTo: userId });
const completedTasks = await Task.countDocuments({ 
  assignedTo: userId,
  status: 'completed' 
});
const progress = Math.round((completedTasks / totalTasks) * 100);
```

**Get all new hires in a department**:
```javascript
const newHires = await User.find({
  role: 'new_hire',
  department: 'Engineering',
  onboardingStatus: { $in: ['pending', 'in_progress'] }
})
.populate('manager', 'firstName lastName')
.populate('buddy', 'firstName lastName')
.sort({ joiningDate: -1 });
```

**Find overdue tasks**:
```javascript
const overdueTasks = await Task.find({
  assignedTo: userId,
  status: { $ne: 'completed' },
  dueDate: { $lt: new Date() }
});
```

### Aggregation Examples

**Department-wise onboarding statistics**:
```javascript
const stats = await User.aggregate([
  { $match: { role: 'new_hire' } },
  { $group: {
    _id: '$department',
    count: { $sum: 1 },
    avgProgress: { $avg: '$onboardingProgress' },
    completed: {
      $sum: { $cond: [{ $eq: ['$onboardingStatus', 'completed'] }, 1, 0] }
    }
  }},
  { $sort: { avgProgress: -1 } }
]);
```

**Task completion rate by category**:
```javascript
const completionRates = await Task.aggregate([
  { $group: {
    _id: '$category',
    total: { $sum: 1 },
    completed: {
      $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
    }
  }},
  { $project: {
    category: '$_id',
    total: 1,
    completed: 1,
    completionRate: { 
      $multiply: [
        { $divide: ['$completed', '$total'] },
        100
      ]
    }
  }}
]);
```

---

For more information about the database architecture and relationships, see [Architecture Documentation](./ARCHITECTURE.md).

For API endpoints that interact with these collections, see [API Documentation](./API_DOCUMENTATION.md).
