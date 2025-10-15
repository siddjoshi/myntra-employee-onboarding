# Myntra Employee Onboarding Application

A comprehensive employee onboarding platform built for Myntra to streamline the new hire experience. This application helps HR teams, managers, and new employees efficiently manage the onboarding process from pre-joining to full integration.

![Myntra Onboarding](https://img.shields.io/badge/Myntra-Onboarding-ff3f6c)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🌟 Features

### For New Hires
- **Personalized Dashboard** - Track onboarding progress with visual indicators
- **Task Management** - Clear checklist of onboarding tasks with due dates
- **Document Upload** - Securely upload and manage required documents
- **Training Modules** - Interactive training with quizzes and certifications
- **Real-time Progress Tracking** - See completion percentage and milestones
- **Manager & Buddy Assignment** - Connect with mentors and team leads

### For HR Administrators
- **Employee Management** - View and manage all new hires
- **Task Assignment** - Create and assign onboarding tasks to employees
- **Document Verification** - Review and verify uploaded documents
- **Analytics Dashboard** - Track onboarding metrics and completion rates
- **Training Module Creation** - Design custom training content
- **Bulk Operations** - Manage multiple employees efficiently

### For Managers
- **Team View** - Monitor onboarding progress of team members
- **Task Oversight** - Review and assign department-specific tasks
- **Direct Communication** - Provide guidance and feedback
- **Progress Reports** - Track team onboarding completion

## 🏗️ Architecture

### Tech Stack

#### Frontend
- **Next.js 14** - React framework for production
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **React Icons** - Beautiful icon library
- **Axios** - HTTP client for API calls

#### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **Multer** - File upload handling
- **bcryptjs** - Password hashing

### Project Structure

```
myntra-employee-onboarding/
├── pages/                  # Next.js pages
│   ├── index.tsx          # Login/Register page
│   ├── dashboard.tsx      # Main dashboard
│   └── _app.tsx           # App wrapper
├── components/            # React components
├── hooks/                 # Custom React hooks
│   └── useAuth.ts        # Authentication hook
├── utils/                # Utility functions
│   └── api.ts            # API client
├── styles/               # Global styles
│   └── globals.css       # Tailwind CSS
├── server/               # Backend server
│   ├── models/          # Mongoose models
│   │   ├── User.js
│   │   ├── Task.js
│   │   ├── Document.js
│   │   └── Training.js
│   ├── routes/          # API routes
│   │   ├── auth.js
│   │   ├── tasks.js
│   │   ├── documents.js
│   │   ├── training.js
│   │   └── dashboard.js
│   ├── middleware/      # Express middleware
│   │   └── auth.js
│   └── index.js         # Server entry point
├── uploads/             # File storage
├── .env.example         # Environment variables template
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB installed and running
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd myntra-employee-onboarding
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   ```env
   MONGODB_URI=mongodb://localhost:27017/myntra-onboarding
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   PORT=5000
   NODE_ENV=development
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

4. **Start MongoDB**
   ```bash
   # macOS with Homebrew
   brew services start mongodb-community
   
   # Or manually
   mongod --dbpath /usr/local/var/mongodb
   ```

5. **Run the application**
   
   **Option 1: Run both frontend and backend together**
   ```bash
   npm run dev:all
   ```
   
   **Option 2: Run separately**
   
   Terminal 1 (Backend):
   ```bash
   npm run server
   ```
   
   Terminal 2 (Frontend):
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api
   - Health Check: http://localhost:5000/api/health

## 📖 User Guide

### First Time Setup

1. **Register a New Account**
   - Navigate to http://localhost:3000
   - Click "Register" tab
   - Fill in your details:
     - Name and email
     - Department and designation
     - Joining date
   - Create a secure password
   - Submit to create your account

2. **Login**
   - Use your email and password
   - You'll be redirected to your dashboard

3. **Complete Your Profile**
   - Upload profile picture
   - Add emergency contact details
   - Update phone and address

### Daily Workflow

#### For New Hires

1. **Check Dashboard**
   - View your onboarding progress
   - See upcoming tasks and deadlines
   - Check training requirements

2. **Complete Tasks**
   - Navigate to Tasks section
   - Review task details
   - Update status as you progress
   - Mark complete when done

3. **Upload Documents**
   - Go to Documents section
   - Click "Upload Document"
   - Select document type
   - Upload file (max 5MB)
   - Wait for HR verification

4. **Complete Training**
   - Access Training section
   - Watch videos and read content
   - Take quizzes (70% passing score)
   - Get certified upon completion

#### For HR Administrators

1. **Monitor New Hires**
   - View all employees dashboard
   - Check onboarding progress
   - Identify blockers

2. **Assign Tasks**
   - Create custom tasks
   - Set priorities and due dates
   - Assign to specific employees

3. **Verify Documents**
   - Review uploaded documents
   - Approve or reject with feedback
   - Track verification status

4. **Create Training**
   - Design training modules
   - Add videos and resources
   - Create assessment quizzes
   - Publish to employees

## 🔐 User Roles & Permissions

### New Hire (new_hire)
- ✅ View own dashboard and progress
- ✅ Manage own tasks
- ✅ Upload documents
- ✅ Complete training modules
- ✅ Update personal profile
- ❌ Cannot access other employees' data

### HR Administrator (hr_admin)
- ✅ Full access to all features
- ✅ Manage all employees
- ✅ Create and assign tasks
- ✅ Verify documents
- ✅ Create training modules
- ✅ View analytics and reports
- ✅ Assign managers and buddies

### Manager (manager)
- ✅ View team members' progress
- ✅ Assign department tasks
- ✅ Monitor team onboarding
- ✅ Provide feedback
- ❌ Cannot access other departments

### Buddy (buddy)
- ✅ View assigned mentee's progress
- ✅ Provide guidance
- ✅ Track onboarding journey
- ❌ Limited administrative access

## 📡 API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new user
```json
{
  "email": "user@myntra.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "department": "Engineering",
  "designation": "Software Engineer",
  "joiningDate": "2025-10-15"
}
```

#### POST /api/auth/login
Login user
```json
{
  "email": "user@myntra.com",
  "password": "securePassword123"
}
```

#### GET /api/auth/me
Get current user details (requires authentication)

### Task Endpoints

#### GET /api/tasks
Get all tasks for current user

Query Parameters:
- `status` - Filter by status (pending, in_progress, completed, blocked)
- `category` - Filter by category

#### POST /api/tasks
Create new task (HR/Manager only)
```json
{
  "title": "Complete IT Setup",
  "description": "Configure laptop and access",
  "category": "it_setup",
  "priority": "high",
  "assignedTo": "userId",
  "dueDate": "2025-10-20"
}
```

#### PATCH /api/tasks/:id/status
Update task status
```json
{
  "status": "completed",
  "notes": "Task completed successfully"
}
```

### Document Endpoints

#### POST /api/documents/upload
Upload document (multipart/form-data)
- `document` - File (max 5MB)
- `documentType` - Type of document
- `isRequired` - Boolean

#### GET /api/documents
Get all documents for current user

#### PATCH /api/documents/:id/verify
Verify document (HR only)
```json
{
  "status": "verified",
  "rejectionReason": "Optional reason for rejection"
}
```

### Training Endpoints

#### GET /api/training
Get all training modules with user progress

#### POST /api/training/:id/progress
Update training progress
```json
{
  "progress": 75,
  "status": "in_progress",
  "quizScore": 85
}
```

### Dashboard Endpoints

#### GET /api/dashboard/stats
Get dashboard statistics for current user

#### GET /api/dashboard/new-hires
Get all new hires (HR/Manager only)

#### GET /api/dashboard/hr-stats
Get HR admin statistics

## 🎨 Customization

### Branding

Update Myntra brand colors in `tailwind.config.js`:

```javascript
colors: {
  myntra: {
    primary: '#ff3f6c',    // Main pink
    secondary: '#282c3f',  // Dark gray
    accent: '#ff905a',     // Orange
    light: '#f5f5f6',      // Light gray
    dark: '#282c3f',       // Dark
  },
}
```

### Task Categories

Modify in `server/models/Task.js`:

```javascript
category: {
  enum: [
    'pre_joining',
    'day_1',
    'week_1',
    'month_1',
    'training',
    'documentation',
    'it_setup',
    'hr_formalities',
    // Add custom categories
  ],
}
```

### Document Types

Modify in `server/models/Document.js`:

```javascript
documentType: {
  enum: [
    'aadhaar',
    'pan_card',
    'passport',
    // Add custom document types
  ],
}
```

## 🧪 Testing

### Manual Testing

1. **Create Test Users**
   ```bash
   # Register users with different roles via the UI
   # Or use MongoDB directly
   ```

2. **Test User Journeys**
   - New hire registration → task completion → training
   - HR admin creating tasks and verifying documents
   - Manager monitoring team progress

### API Testing with cURL

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@myntra.com","password":"password123"}'

# Get tasks (replace TOKEN with actual JWT)
curl -X GET http://localhost:5000/api/tasks \
  -H "Authorization: Bearer TOKEN"
```

## 🚢 Deployment

### Production Considerations

1. **Environment Variables**
   - Use strong JWT secret
   - Configure production MongoDB URI
   - Set NODE_ENV=production

2. **Security**
   - Enable HTTPS
   - Configure CORS properly
   - Implement rate limiting
   - Add input validation
   - Sanitize user inputs

3. **File Storage**
   - Use cloud storage (AWS S3, Google Cloud Storage)
   - Implement CDN for static assets
   - Add virus scanning for uploads

4. **Monitoring**
   - Add logging (Winston, Morgan)
   - Implement error tracking (Sentry)
   - Monitor performance (New Relic, DataDog)

### Deployment Options

**Option 1: Vercel (Frontend) + Railway (Backend)**

Frontend:
```bash
npm run build
vercel deploy
```

Backend:
```bash
# Deploy to Railway with MongoDB add-on
```

**Option 2: Docker**

Create `Dockerfile` and `docker-compose.yml` for containerization.

**Option 3: AWS/Azure/GCP**

Deploy using cloud-native services.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Support

For support and questions:
- Email: hr@myntra.com
- Slack: #onboarding-support
- Documentation: [Internal Wiki]

## 🎯 Future Enhancements

- [ ] Mobile app (React Native)
- [ ] Email notifications
- [ ] Calendar integration
- [ ] Video conferencing for orientation
- [ ] AI-powered task recommendations
- [ ] Multilingual support
- [ ] Advanced analytics and reporting
- [ ] Integration with HRMS systems
- [ ] Slack/Teams bot integration
- [ ] Gamification features

---

**Built with ❤️ for Myntra**

*Making onboarding awesome, one employee at a time!*
