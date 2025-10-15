# Developer Guide

## Table of Contents
- [Getting Started](#getting-started)
- [Development Environment Setup](#development-environment-setup)
- [Project Structure](#project-structure)
- [Coding Conventions](#coding-conventions)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Debugging](#debugging)
- [Common Development Tasks](#common-development-tasks)
- [Troubleshooting](#troubleshooting)
- [Performance Optimization](#performance-optimization)

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

```bash
# Check Node.js version (should be 18+)
node --version

# Check npm version
npm --version

# Check MongoDB version (should be 6+)
mongod --version

# Check Git version
git --version
```

### Initial Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/siddjoshi/myntra-employee-onboarding.git
   cd myntra-employee-onboarding
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your local configuration:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/myntra-onboarding
   
   # JWT Secret (use a strong random string in production)
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   
   # Server Port
   PORT=5000
   
   # Node Environment
   NODE_ENV=development
   
   # Frontend URL (for CORS)
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

4. **Start MongoDB**
   ```bash
   # macOS with Homebrew
   brew services start mongodb-community
   
   # Or manually
   mongod --dbpath /usr/local/var/mongodb
   ```

5. **Seed the Database** (Optional but recommended)
   ```bash
   npm run seed
   ```
   
   This creates test users:
   - HR Admin: `hr@myntra.com / password123`
   - Manager: `manager@myntra.com / password123`
   - Buddy: `buddy@myntra.com / password123`
   - New Hire: `newhire@myntra.com / password123`

6. **Start Development Servers**
   ```bash
   # Start both frontend and backend
   npm run dev:all
   
   # Or start separately
   # Terminal 1: Backend
   npm run server
   
   # Terminal 2: Frontend
   npm run dev
   ```

7. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api
   - Health Check: http://localhost:5000/api/health

## Development Environment Setup

### Recommended IDE: VS Code

**Essential Extensions**:
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "mongodb.mongodb-vscode",
    "christian-kohler.path-intellisense",
    "formulahendry.auto-rename-tag",
    "dsznajder.es7-react-js-snippets"
  ]
}
```

**VS Code Settings** (`.vscode/settings.json`):
```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "tailwindCSS.experimental.classRegex": [
    ["className\\s*=\\s*['\"`]([^'\"`]*)['\"`]", "([^'\"`]*)"]
  ]
}
```

### Git Configuration

```bash
# Set your name and email
git config user.name "Your Name"
git config user.email "your.email@myntra.com"

# Set up Git aliases
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.st status
```

### MongoDB Tools

**Install MongoDB Compass** (GUI for MongoDB):
- Download: https://www.mongodb.com/try/download/compass
- Connect to: `mongodb://localhost:27017`
- Database: `myntra-onboarding`

**MongoDB Shell Commands**:
```bash
# Connect to database
mongosh

# Switch to our database
use myntra-onboarding

# View collections
show collections

# Query users
db.users.find().pretty()

# Count documents
db.users.countDocuments()

# Drop database (careful!)
db.dropDatabase()
```

## Project Structure

```
myntra-employee-onboarding/
├── .github/                    # GitHub configuration
│   ├── instructions/           # Custom agent instructions
│   └── prompts/               # Custom prompts
├── docs/                      # Documentation (this directory)
│   ├── API_DOCUMENTATION.md
│   ├── ARCHITECTURE.md
│   ├── DEVELOPER_GUIDE.md
│   └── ...
├── pages/                     # Next.js pages (Frontend)
│   ├── _app.tsx              # App wrapper
│   ├── index.tsx             # Login/Register page
│   └── dashboard.tsx         # Main dashboard
├── hooks/                     # Custom React hooks
│   └── useAuth.ts            # Authentication hook
├── utils/                     # Utility functions
│   └── api.ts                # API client
├── styles/                    # Global styles
│   └── globals.css           # Tailwind CSS + custom styles
├── server/                    # Backend (Express.js)
│   ├── models/               # Mongoose models
│   │   ├── User.js
│   │   ├── Task.js
│   │   ├── Document.js
│   │   └── Training.js
│   ├── routes/               # API routes
│   │   ├── auth.js
│   │   ├── tasks.js
│   │   ├── documents.js
│   │   ├── training.js
│   │   └── dashboard.js
│   ├── middleware/           # Express middleware
│   │   └── auth.js
│   ├── index.js             # Server entry point
│   └── seed.js              # Database seeding script
├── uploads/                   # File storage
│   └── documents/            # Uploaded documents
├── .env                      # Environment variables (not in git)
├── .env.example             # Environment template
├── .gitignore               # Git ignore rules
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── next.config.js           # Next.js configuration
├── README.md                # Project overview
├── REQUIREMENTS.md          # Detailed requirements
└── QUICK_START.md           # Quick start guide
```

### File Naming Conventions

| File Type | Convention | Example |
|-----------|------------|---------|
| React Components (TSX) | PascalCase | `Dashboard.tsx`, `TaskList.tsx` |
| TypeScript Utils | camelCase | `api.ts`, `helpers.ts` |
| Backend Models (JS) | PascalCase | `User.js`, `Task.js` |
| Backend Routes (JS) | camelCase | `auth.js`, `tasks.js` |
| CSS/Styles | kebab-case | `globals.css`, `components.css` |
| Config Files | kebab-case | `tailwind.config.js` |

## Coding Conventions

### Frontend (TypeScript/React)

#### Component Structure

```typescript
// pages/dashboard.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { tasksAPI } from '@/utils/api';

interface Task {
  _id: string;
  title: string;
  status: string;
  dueDate: string;
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await tasksAPI.getTasks();
        setTasks(response.data.tasks);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to fetch tasks');
      }
    };

    if (user) {
      fetchTasks();
    }
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      {error && <div className="alert alert-error">{error}</div>}
      {/* Component content */}
    </div>
  );
}
```

#### Custom Hooks

```typescript
// hooks/useAuth.ts
import { useState, useEffect, createContext, useContext } from 'react';
import { authAPI } from '@/utils/api';

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuth = (): AuthContextType => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Implementation...
  
  return { user, loading, login, logout };
};
```

#### API Client Pattern

```typescript
// utils/api.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// API methods
export const tasksAPI = {
  getTasks: (params?: any) => api.get('/tasks', { params }),
  getTask: (id: string) => api.get(`/tasks/${id}`),
  createTask: (data: any) => api.post('/tasks', data),
  updateTaskStatus: (id: string, data: any) => api.patch(`/tasks/${id}/status`, data),
  deleteTask: (id: string) => api.delete(`/tasks/${id}`),
};

export default api;
```

### Backend (JavaScript/Express)

#### Route Handler Structure

```javascript
// server/routes/tasks.js
const express = require('express');
const Task = require('../models/Task');
const User = require('../models/User');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/tasks - Get all tasks for user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, category, priority } = req.query;
    
    // Build query
    const query = { assignedTo: req.user.userId };
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    
    // Fetch tasks
    const tasks = await Task.find(query)
      .populate('assignedBy', 'firstName lastName email')
      .sort({ dueDate: 1, priority: -1 });
    
    res.json({ tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// POST /api/tasks - Create new task (HR/Manager only)
router.post('/', authMiddleware, roleMiddleware('hr_admin', 'manager'), async (req, res) => {
  try {
    const { title, description, category, priority, assignedTo, dueDate } = req.body;
    
    // Validation
    if (!title || !description || !assignedTo || !dueDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check if assignee exists
    const user = await User.findById(assignedTo);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Create task
    const task = new Task({
      title,
      description,
      category,
      priority,
      assignedTo,
      assignedBy: req.user.userId,
      dueDate,
      status: 'pending',
      isCompleted: false,
    });
    
    await task.save();
    
    res.status(201).json({
      message: 'Task created successfully',
      task,
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

module.exports = router;
```

#### Model Structure

```javascript
// server/models/Task.js
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['pre_joining', 'day_1', 'week_1', 'month_1', 'training', 'documentation', 'it_setup', 'hr_formalities'],
    required: true,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'blocked'],
    default: 'pending',
  },
  dueDate: {
    type: Date,
    required: true,
  },
  completedAt: Date,
  isCompleted: {
    type: Boolean,
    default: false,
  },
  order: {
    type: Number,
    default: 0,
  },
  dependencies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
  }],
  attachments: [{
    fileName: String,
    fileUrl: String,
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  notes: String,
}, {
  timestamps: true,
});

// Indexes
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ dueDate: 1, status: 1 });

// Pre-save hook
taskSchema.pre('save', function(next) {
  if (this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
    this.isCompleted = true;
  }
  next();
});

// Instance methods
taskSchema.methods.complete = async function() {
  this.status = 'completed';
  this.isCompleted = true;
  this.completedAt = new Date();
  await this.save();
  
  // Update user onboarding progress
  await updateOnboardingProgress(this.assignedTo);
};

module.exports = mongoose.model('Task', taskSchema);
```

### CSS/Styling Conventions

```css
/* styles/globals.css */

/* Tailwind directives */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom utility classes */
@layer components {
  .btn-primary {
    @apply bg-myntra-primary hover:bg-myntra-accent text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200;
  }
  
  .btn-secondary {
    @apply bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors duration-200;
  }
  
  .card {
    @apply bg-white rounded-lg shadow-md p-6;
  }
  
  .badge-success {
    @apply bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium;
  }
  
  .badge-warning {
    @apply bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium;
  }
  
  .badge-danger {
    @apply bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium;
  }
  
  .badge-info {
    @apply bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium;
  }
}
```

## Development Workflow

### Feature Development Process

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/add-notifications
   ```

2. **Make Changes**
   - Write code following conventions
   - Test changes locally
   - Write/update tests if applicable

3. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add email notification system"
   ```
   
   **Commit Message Convention**:
   ```
   type(scope): subject
   
   body
   
   footer
   ```
   
   **Types**:
   - `feat`: New feature
   - `fix`: Bug fix
   - `docs`: Documentation changes
   - `style`: Code style changes (formatting, etc.)
   - `refactor`: Code refactoring
   - `test`: Adding or updating tests
   - `chore`: Maintenance tasks

4. **Push Branch**
   ```bash
   git push origin feature/add-notifications
   ```

5. **Create Pull Request**
   - Go to GitHub repository
   - Click "New Pull Request"
   - Fill in description and details
   - Request review

### Code Review Checklist

**For Reviewer**:
- [ ] Code follows project conventions
- [ ] No security vulnerabilities
- [ ] Proper error handling
- [ ] Tests included (if applicable)
- [ ] Documentation updated
- [ ] No unnecessary dependencies
- [ ] Performance considerations
- [ ] Backward compatibility maintained

**For Author**:
- [ ] Self-review completed
- [ ] All tests pass locally
- [ ] Linting passes
- [ ] Documentation updated
- [ ] Breaking changes documented
- [ ] Environment variables documented

## Testing

### Manual Testing

**Test User Accounts** (after seeding):
```
HR Admin: hr@myntra.com / password123
Manager: manager@myntra.com / password123
Buddy: buddy@myntra.com / password123
New Hire: newhire@myntra.com / password123
```

**Test Scenarios**:

1. **Authentication Flow**
   - Register new user
   - Login with valid credentials
   - Login with invalid credentials
   - Access protected routes without token
   - Token expiration handling

2. **Task Management**
   - Create task as HR/Manager
   - View tasks as new hire
   - Update task status
   - Mark task as complete
   - Verify progress update

3. **Document Upload**
   - Upload valid document
   - Upload invalid file type
   - Upload file exceeding size limit
   - Verify document as HR
   - Reject document with reason

4. **Training Modules**
   - View training modules
   - Start training
   - Update progress
   - Complete quiz
   - Pass/fail scenarios

### API Testing with cURL

```bash
# 1. Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@myntra.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User",
    "department": "Engineering",
    "designation": "Developer",
    "joiningDate": "2025-11-01"
  }'

# 2. Login
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@myntra.com",
    "password": "password123"
  }' | jq -r '.token')

# 3. Get tasks
curl -X GET http://localhost:5000/api/tasks \
  -H "Authorization: Bearer $TOKEN"

# 4. Create task (as HR)
curl -X POST http://localhost:5000/api/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Task",
    "description": "This is a test task",
    "category": "day_1",
    "priority": "medium",
    "assignedTo": "USER_ID_HERE",
    "dueDate": "2025-11-05"
  }'
```

### API Testing with Postman

1. **Import Collection**
   - Create a Postman collection named "Myntra Onboarding"
   - Add environment variables:
     - `base_url`: `http://localhost:5000/api`
     - `token`: (set after login)

2. **Create Requests**
   ```
   Auth/
     ├── Register
     ├── Login
     └── Get Profile
   Tasks/
     ├── Get All Tasks
     ├── Create Task
     ├── Update Task Status
     └── Delete Task
   Documents/
     ├── Upload Document
     ├── Get Documents
     └── Verify Document
   ```

3. **Use Variables**
   ```javascript
   // In Tests tab of Login request
   pm.environment.set("token", pm.response.json().token);
   ```

## Debugging

### Frontend Debugging

**Browser DevTools**:
```typescript
// Add console logs
console.log('User data:', user);
console.error('Error occurred:', error);

// Use debugger statement
debugger;

// Log API calls
axios.interceptors.request.use((config) => {
  console.log('API Request:', config.method, config.url);
  return config;
});
```

**React DevTools**:
- Install React Developer Tools browser extension
- Inspect component props and state
- Profile component performance

### Backend Debugging

**Node.js Debugger**:
```bash
# Start server in debug mode
node --inspect server/index.js

# Or with nodemon
nodemon --inspect server/index.js
```

**VS Code Debugging**:

Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/server/index.js",
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
```

**Logging**:
```javascript
// Add detailed logging
console.log('Request received:', req.method, req.url);
console.log('Request body:', req.body);
console.log('User:', req.user);
console.log('Query result:', result);
```

### Database Debugging

**MongoDB Queries**:
```bash
# Connect to MongoDB
mongosh

# Use database
use myntra-onboarding

# Find slow queries
db.setProfilingLevel(2)
db.system.profile.find().limit(10).sort({ ts: -1 }).pretty()

# Explain query
db.tasks.find({ assignedTo: "user_id" }).explain("executionStats")

# View indexes
db.tasks.getIndexes()
```

## Common Development Tasks

### Adding a New API Endpoint

1. **Create Route Handler**
   ```javascript
   // server/routes/feedback.js
   const express = require('express');
   const Feedback = require('../models/Feedback');
   const { authMiddleware } = require('../middleware/auth');
   
   const router = express.Router();
   
   router.post('/', authMiddleware, async (req, res) => {
     try {
       const { content, rating } = req.body;
       
       const feedback = new Feedback({
         userId: req.user.userId,
         content,
         rating,
       });
       
       await feedback.save();
       
       res.status(201).json({
         message: 'Feedback submitted successfully',
         feedback,
       });
     } catch (error) {
       res.status(500).json({ error: 'Failed to submit feedback' });
     }
   });
   
   module.exports = router;
   ```

2. **Register Route**
   ```javascript
   // server/index.js
   const feedbackRoutes = require('./routes/feedback');
   app.use('/api/feedback', feedbackRoutes);
   ```

3. **Add to API Client**
   ```typescript
   // utils/api.ts
   export const feedbackAPI = {
     submit: (data: any) => api.post('/feedback', data),
     getAll: () => api.get('/feedback'),
   };
   ```

### Adding a New Database Model

1. **Create Model File**
   ```javascript
   // server/models/Feedback.js
   const mongoose = require('mongoose');
   
   const feedbackSchema = new mongoose.Schema({
     userId: {
       type: mongoose.Schema.Types.ObjectId,
       ref: 'User',
       required: true,
     },
     content: {
       type: String,
       required: true,
     },
     rating: {
       type: Number,
       min: 1,
       max: 5,
       required: true,
     },
   }, {
     timestamps: true,
   });
   
   module.exports = mongoose.model('Feedback', feedbackSchema);
   ```

2. **Add Validation**
   ```javascript
   feedbackSchema.pre('save', function(next) {
     if (this.rating < 1 || this.rating > 5) {
       throw new Error('Rating must be between 1 and 5');
     }
     next();
   });
   ```

### Adding Environment Variables

1. **Add to `.env`**
   ```env
   NEW_FEATURE_API_KEY=your-api-key-here
   ```

2. **Add to `.env.example`**
   ```env
   NEW_FEATURE_API_KEY=your-api-key-here
   ```

3. **Use in Code**
   ```javascript
   const apiKey = process.env.NEW_FEATURE_API_KEY;
   ```

### Database Migrations

**Resetting Database**:
```bash
# Connect to MongoDB
mongosh

# Drop database
use myntra-onboarding
db.dropDatabase()

# Reseed
npm run seed
```

**Adding New Fields to Existing Documents**:
```javascript
// Create migration script: server/migrations/add-phone-field.js
const mongoose = require('mongoose');
const User = require('../models/User');

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  // Update all users without phone field
  await User.updateMany(
    { phone: { $exists: false } },
    { $set: { phone: '' } }
  );
  
  console.log('Migration completed');
  process.exit(0);
}

migrate();
```

## Troubleshooting

### Common Issues and Solutions

#### Issue: Port Already in Use

**Error**: `EADDRINUSE: address already in use :::3000`

**Solution**:
```bash
# Find process using port
lsof -ti:3000

# Kill process
lsof -ti:3000 | xargs kill -9

# Or change port in package.json
"dev": "next dev -p 3001"
```

#### Issue: MongoDB Connection Failed

**Error**: `MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017`

**Solution**:
```bash
# Check if MongoDB is running
ps aux | grep mongod

# Start MongoDB
brew services start mongodb-community

# Check logs
tail -f /usr/local/var/log/mongodb/mongo.log
```

#### Issue: Module Not Found

**Error**: `Cannot find module 'xyz'`

**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Or install specific package
npm install xyz
```

#### Issue: JWT Token Invalid

**Error**: `JsonWebTokenError: invalid signature`

**Solution**:
- Check JWT_SECRET in `.env` matches between sessions
- Clear browser localStorage
- Generate new token by logging in again

#### Issue: File Upload Fails

**Error**: `ENOENT: no such file or directory, open 'uploads/documents/...'`

**Solution**:
```bash
# Create uploads directory
mkdir -p uploads/documents
mkdir -p uploads/profiles

# Check permissions
chmod 755 uploads
```

## Performance Optimization

### Frontend Optimization

1. **Code Splitting**
   ```typescript
   // Dynamic imports for large components
   import dynamic from 'next/dynamic';
   
   const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
     loading: () => <p>Loading...</p>,
   });
   ```

2. **Image Optimization**
   ```typescript
   import Image from 'next/image';
   
   <Image
     src="/logo.png"
     alt="Logo"
     width={200}
     height={100}
     priority
   />
   ```

3. **Memoization**
   ```typescript
   import { useMemo, useCallback } from 'react';
   
   const expensiveValue = useMemo(() => {
     return computeExpensiveValue(a, b);
   }, [a, b]);
   
   const handleClick = useCallback(() => {
     doSomething(a);
   }, [a]);
   ```

### Backend Optimization

1. **Database Queries**
   ```javascript
   // Use projection to limit fields
   const users = await User.find({}, 'firstName lastName email');
   
   // Use lean() for read-only data
   const tasks = await Task.find({}).lean();
   
   // Add indexes
   taskSchema.index({ assignedTo: 1, status: 1 });
   ```

2. **Pagination**
   ```javascript
   const page = parseInt(req.query.page) || 1;
   const limit = parseInt(req.query.limit) || 10;
   const skip = (page - 1) * limit;
   
   const tasks = await Task.find({})
     .skip(skip)
     .limit(limit);
   ```

3. **Caching** (Future Implementation)
   ```javascript
   // Implement Redis caching for frequently accessed data
   const cachedData = await redis.get(cacheKey);
   if (cachedData) {
     return JSON.parse(cachedData);
   }
   ```

---

For more information, refer to:
- [API Documentation](./API_DOCUMENTATION.md)
- [Architecture Documentation](./ARCHITECTURE.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
