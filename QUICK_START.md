# Quick Start Guide 🚀

This guide will help you get the Myntra Employee Onboarding Application up and running in just a few minutes!

## Prerequisites ✅

Make sure you have these installed:
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v6 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **npm** or **yarn**

## Installation Steps

### 1️⃣ Install Dependencies

```bash
npm install
```

This will install all required packages for both frontend and backend.

### 2️⃣ Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

The default values work for local development - no changes needed!

### 3️⃣ Start MongoDB

**macOS (with Homebrew):**
```bash
brew services start mongodb-community
```

**macOS (manual):**
```bash
mongod --dbpath /usr/local/var/mongodb
```

**Windows:**
```bash
net start MongoDB
```

**Linux:**
```bash
sudo systemctl start mongod
```

### 4️⃣ Seed the Database (Optional but Recommended)

Populate the database with sample data:

```bash
npm run seed
```

This creates test users with different roles:
- **HR Admin**: hr@myntra.com / password123
- **Manager**: manager@myntra.com / password123
- **Buddy**: buddy@myntra.com / password123
- **New Hire**: newhire@myntra.com / password123

### 5️⃣ Start the Application

Run both frontend and backend together:

```bash
npm run dev:all
```

**Or run them separately:**

Terminal 1 (Backend):
```bash
npm run server
```

Terminal 2 (Frontend):
```bash
npm run dev
```

### 6️⃣ Access the Application

Open your browser and navigate to:

🌐 **Frontend**: http://localhost:3000
🔌 **Backend API**: http://localhost:5000/api
💚 **Health Check**: http://localhost:5000/api/health

## First Login

### Option 1: Use Seeded Test Users

Login with any of the test accounts:

```
Email: newhire@myntra.com
Password: password123
```

### Option 2: Create a New Account

1. Click the "Register" tab
2. Fill in your details
3. Start your onboarding journey!

## What's Next?

### For New Hires:
1. ✅ Complete your profile
2. 📋 Check your tasks
3. 📄 Upload required documents
4. 🎓 Complete training modules

### For HR Admins:
1. 👥 View all new hires
2. ✏️ Create and assign tasks
3. ✔️ Verify documents
4. 📊 Monitor onboarding progress

### For Managers:
1. 👀 Monitor your team's progress
2. 📝 Assign department-specific tasks
3. 💬 Provide guidance

## Troubleshooting

### MongoDB Connection Error

**Error**: `MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017`

**Solution**: Make sure MongoDB is running:
```bash
# Check if MongoDB is running
ps aux | grep mongod

# If not, start it
brew services start mongodb-community  # macOS
sudo systemctl start mongod            # Linux
net start MongoDB                      # Windows
```

### Port Already in Use

**Error**: `Port 3000 is already in use` or `Port 5000 is already in use`

**Solution**: Kill the process or change the port:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in .env
PORT=5001
```

### Module Not Found

**Error**: `Cannot find module 'xyz'`

**Solution**: Reinstall dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Database Seeding Fails

**Solution**: Drop the database and try again:
```bash
# Connect to MongoDB
mongosh

# Drop database
use myntra-onboarding
db.dropDatabase()

# Exit and reseed
npm run seed
```

## Common Commands

```bash
# Install dependencies
npm install

# Start development (both frontend & backend)
npm run dev:all

# Start backend only
npm run server

# Start frontend only
npm run dev

# Seed database with test data
npm run seed

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Architecture Overview

```
┌─────────────┐          ┌─────────────┐          ┌─────────────┐
│             │          │             │          │             │
│   Next.js   │ ◄─────► │  Express    │ ◄─────► │   MongoDB   │
│  Frontend   │   API    │   Backend   │   ODM    │  Database   │
│             │          │             │          │             │
└─────────────┘          └─────────────┘          └─────────────┘
Port 3000                Port 5000                Port 27017
```

## Features Overview

### 📊 Dashboard
- Real-time onboarding progress
- Task statistics
- Document verification status
- Training completion metrics

### 📋 Task Management
- Create and assign tasks
- Priority levels and due dates
- Status tracking
- Task dependencies

### 📄 Document Management
- Secure file uploads
- Document verification workflow
- Support for multiple document types
- 5MB file size limit

### 🎓 Training Modules
- Interactive content
- Video and presentation support
- Quizzes and assessments
- Progress tracking

### 👥 User Management
- Role-based access control
- Manager and buddy assignments
- Profile management
- User analytics

## Need Help?

- 📖 Read the full [README.md](./README.md)
- 🐛 Check the [Troubleshooting](#troubleshooting) section
- 💬 Contact: hr@myntra.com

## Success! 🎉

If you can see the login page at http://localhost:3000, congratulations! You're all set up.

Happy onboarding! 🚀

---

**Made with ❤️ for Myntra**
