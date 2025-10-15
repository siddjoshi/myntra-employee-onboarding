const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Task = require('./models/Task');
const { TrainingModule } = require('./models/Training');
const mongoose = require('mongoose');
require('dotenv').config();

// Sample data for seeding the database
const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Task.deleteMany({});
    await TrainingModule.deleteMany({});

    console.log('Cleared existing data');

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create HR Admin
    const hrAdmin = await User.create({
      email: 'hr@myntra.com',
      password: hashedPassword,
      firstName: 'Priya',
      lastName: 'Sharma',
      role: 'hr_admin',
      department: 'HR',
      designation: 'HR Manager',
      joiningDate: new Date('2020-01-01'),
      employeeId: 'MYN001',
    });

    // Create Manager
    const manager = await User.create({
      email: 'manager@myntra.com',
      password: hashedPassword,
      firstName: 'Rahul',
      lastName: 'Verma',
      role: 'manager',
      department: 'Engineering',
      designation: 'Engineering Manager',
      joiningDate: new Date('2021-06-01'),
      employeeId: 'MYN002',
    });

    // Create Buddy
    const buddy = await User.create({
      email: 'buddy@myntra.com',
      password: hashedPassword,
      firstName: 'Ananya',
      lastName: 'Desai',
      role: 'buddy',
      department: 'Engineering',
      designation: 'Senior Software Engineer',
      joiningDate: new Date('2022-03-01'),
      employeeId: 'MYN003',
    });

    // Create New Hire
    const newHire = await User.create({
      email: 'newhire@myntra.com',
      password: hashedPassword,
      firstName: 'Arjun',
      lastName: 'Patel',
      role: 'new_hire',
      department: 'Engineering',
      designation: 'Software Engineer',
      joiningDate: new Date(),
      employeeId: 'MYN004',
      manager: manager._id,
      buddy: buddy._id,
    });

    console.log('Created users');

    // Create sample tasks
    const tasks = [
      {
        title: 'Complete Pre-joining Formalities',
        description: 'Submit all required documents before your joining date',
        category: 'pre_joining',
        priority: 'critical',
        assignedTo: newHire._id,
        assignedBy: hrAdmin._id,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        order: 1,
      },
      {
        title: 'IT Equipment Setup',
        description: 'Collect your laptop and configure essential software',
        category: 'day_1',
        priority: 'high',
        assignedTo: newHire._id,
        assignedBy: hrAdmin._id,
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        order: 2,
      },
      {
        title: 'Complete KYC Documentation',
        description: 'Upload Aadhaar, PAN, and other identity documents',
        category: 'documentation',
        priority: 'high',
        assignedTo: newHire._id,
        assignedBy: hrAdmin._id,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        order: 3,
      },
      {
        title: 'Attend Welcome Session',
        description: 'Join the company-wide orientation and welcome meeting',
        category: 'day_1',
        priority: 'medium',
        assignedTo: newHire._id,
        assignedBy: hrAdmin._id,
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        order: 4,
      },
      {
        title: 'Meet Your Team',
        description: 'Introduction meeting with your team members and manager',
        category: 'week_1',
        priority: 'medium',
        assignedTo: newHire._id,
        assignedBy: manager._id,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        order: 5,
      },
      {
        title: 'Complete Mandatory Training',
        description: 'Finish all required training modules',
        category: 'training',
        priority: 'high',
        assignedTo: newHire._id,
        assignedBy: hrAdmin._id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        order: 6,
      },
    ];

    await Task.insertMany(tasks);
    console.log('Created tasks');

    // Create training modules
    const trainingModules = [
      {
        title: 'Welcome to Myntra',
        description: 'Introduction to Myntra culture, values, and mission',
        category: 'company_culture',
        content: `
# Welcome to Myntra!

We're thrilled to have you join our team. Myntra is India's leading fashion and lifestyle e-commerce platform.

## Our Mission
To be the most loved fashion destination for India.

## Our Values
- Customer Obsession
- Innovation
- Integrity
- Collaboration
- Excellence

## What Makes Myntra Special
- Market leader in fashion e-commerce
- 5000+ brands and 5 million+ products
- Cutting-edge technology and AI
- Amazing team culture
        `,
        duration: 30,
        isRequired: true,
        order: 1,
        createdBy: hrAdmin._id,
        quiz: [
          {
            question: 'What is Myntra\'s primary focus?',
            options: ['Fashion and Lifestyle', 'Groceries', 'Electronics', 'Books'],
            correctAnswer: 0,
          },
          {
            question: 'Which of these is NOT a Myntra value?',
            options: ['Innovation', 'Profit First', 'Integrity', 'Customer Obsession'],
            correctAnswer: 1,
          },
        ],
      },
      {
        title: 'Information Security & Data Privacy',
        description: 'Understanding security protocols and data protection',
        category: 'compliance',
        content: `
# Information Security at Myntra

## Why Security Matters
Protecting customer data and company information is everyone's responsibility.

## Key Principles
1. Never share passwords
2. Use strong authentication
3. Report suspicious activities
4. Keep software updated
5. Handle customer data carefully

## Data Privacy
- GDPR compliance
- Customer consent
- Data minimization
- Secure storage
        `,
        duration: 45,
        isRequired: true,
        order: 2,
        createdBy: hrAdmin._id,
        quiz: [
          {
            question: 'Should you share your password with teammates?',
            options: ['Yes, for collaboration', 'No, never', 'Only with managers', 'Sometimes'],
            correctAnswer: 1,
          },
          {
            question: 'What should you do if you notice suspicious activity?',
            options: ['Ignore it', 'Report immediately', 'Investigate yourself', 'Tell friends'],
            correctAnswer: 1,
          },
        ],
      },
      {
        title: 'Product & Technology Overview',
        description: 'Understanding Myntra\'s tech stack and products',
        category: 'technical',
        content: `
# Myntra Technology

## Tech Stack
- **Frontend**: React, Next.js, React Native
- **Backend**: Node.js, Python, Java
- **Database**: MongoDB, MySQL, Redis
- **Cloud**: AWS, Kubernetes
- **AI/ML**: TensorFlow, PyTorch

## Key Products
1. E-commerce Platform
2. Mobile Apps (iOS/Android)
3. Fashion Intelligence
4. Logistics Management
5. Seller Platform

## Innovation Areas
- AI-powered recommendations
- Virtual try-on
- Image search
- Personalization
        `,
        duration: 60,
        isRequired: true,
        order: 3,
        createdBy: hrAdmin._id,
      },
      {
        title: 'Workplace Policies & Code of Conduct',
        description: 'Company policies, ethics, and professional conduct',
        category: 'compliance',
        content: `
# Workplace Policies

## Code of Conduct
- Respect and inclusivity
- Professional behavior
- Conflict of interest
- Anti-harassment policy
- Whistleblower protection

## Working Hours & Leave
- Flexible working hours
- Work from home policy
- Annual leave: 24 days
- Sick leave: 12 days
- Casual leave: 12 days

## Benefits
- Health insurance
- Learning & development
- Wellness programs
- Employee discounts
        `,
        duration: 40,
        isRequired: true,
        order: 4,
        createdBy: hrAdmin._id,
      },
    ];

    await TrainingModule.insertMany(trainingModules);
    console.log('Created training modules');

    console.log('\n✅ Database seeded successfully!\n');
    console.log('Test Users Created:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('HR Admin:');
    console.log('  Email: hr@myntra.com');
    console.log('  Password: password123');
    console.log('');
    console.log('Manager:');
    console.log('  Email: manager@myntra.com');
    console.log('  Password: password123');
    console.log('');
    console.log('Buddy:');
    console.log('  Email: buddy@myntra.com');
    console.log('  Password: password123');
    console.log('');
    console.log('New Hire:');
    console.log('  Email: newhire@myntra.com');
    console.log('  Password: password123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
