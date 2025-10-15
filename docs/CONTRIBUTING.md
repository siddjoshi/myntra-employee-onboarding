# Contributing Guidelines

Thank you for your interest in contributing to the Myntra Employee Onboarding System! This document provides guidelines and best practices for contributing to the project.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Community](#community)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. Please be respectful and constructive in your interactions.

### Expected Behavior

- **Be Respectful**: Treat everyone with respect and consideration
- **Be Collaborative**: Work together and help others
- **Be Professional**: Keep discussions focused and constructive
- **Be Inclusive**: Welcome newcomers and diverse perspectives

### Unacceptable Behavior

- Harassment, discrimination, or offensive comments
- Personal attacks or trolling
- Publishing others' private information
- Spam or irrelevant posts

## Getting Started

### Prerequisites

Before contributing, ensure you have:

1. **Required Software**
   - Node.js 18+ installed
   - MongoDB 6+ installed
   - Git installed
   - A code editor (VS Code recommended)

2. **Knowledge Requirements**
   - JavaScript/TypeScript
   - React and Next.js
   - Express.js
   - MongoDB and Mongoose
   - Git workflow

### Setting Up Development Environment

1. **Fork the Repository**
   ```bash
   # Click the "Fork" button on GitHub
   # Clone your fork
   git clone https://github.com/YOUR_USERNAME/myntra-employee-onboarding.git
   cd myntra-employee-onboarding
   ```

2. **Add Upstream Remote**
   ```bash
   git remote add upstream https://github.com/siddjoshi/myntra-employee-onboarding.git
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Set Up Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

5. **Start Development Servers**
   ```bash
   npm run dev:all
   ```

## How to Contribute

### Types of Contributions

We welcome various types of contributions:

1. **Bug Fixes**
   - Fix existing bugs
   - Improve error handling
   - Resolve edge cases

2. **New Features**
   - Implement new functionality
   - Enhance existing features
   - Add new integrations

3. **Documentation**
   - Improve existing docs
   - Add missing documentation
   - Fix typos and errors
   - Add examples and tutorials

4. **Testing**
   - Write unit tests
   - Add integration tests
   - Improve test coverage

5. **Performance**
   - Optimize queries
   - Improve loading times
   - Reduce bundle size

6. **UI/UX**
   - Improve user interface
   - Enhance user experience
   - Make design responsive

## Development Workflow

### 1. Create an Issue

Before starting work, create or find an issue:

- **Bug Reports**: Describe the bug, steps to reproduce, expected vs actual behavior
- **Feature Requests**: Describe the feature, use cases, and potential implementation
- **Questions**: Ask for clarification on existing features or architecture

### 2. Claim the Issue

- Comment on the issue expressing interest
- Wait for maintainer assignment
- Discuss approach if needed

### 3. Create a Branch

```bash
# Update your fork
git fetch upstream
git checkout main
git merge upstream/main

# Create feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

### 4. Make Changes

- Write code following our standards
- Test your changes thoroughly
- Update documentation as needed
- Add comments for complex logic

### 5. Commit Changes

```bash
git add .
git commit -m "feat: add user notification system"
```

Follow our [commit message guidelines](#commit-message-guidelines).

### 6. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub.

## Coding Standards

### Frontend (TypeScript/React)

**File Structure**:
```typescript
// pages/dashboard.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface DashboardProps {
  // Type your props
}

export default function Dashboard({ }: DashboardProps) {
  // State declarations
  const [loading, setLoading] = useState(true);
  
  // Hooks
  const { user } = useAuth();
  
  // Effects
  useEffect(() => {
    // Effect logic
  }, []);
  
  // Event handlers
  const handleClick = () => {
    // Handler logic
  };
  
  // Render logic
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return (
    <div>
      {/* Component JSX */}
    </div>
  );
}
```

**TypeScript Guidelines**:
- Always use TypeScript for frontend code
- Define interfaces for props and state
- Avoid `any` type - use specific types
- Use `unknown` for truly unknown types

**React Best Practices**:
- Use functional components
- Use hooks for state management
- Implement proper cleanup in useEffect
- Memoize expensive calculations with `useMemo`
- Use `useCallback` for event handlers passed as props

**Styling**:
- Use Tailwind CSS utility classes
- Follow existing component patterns
- Keep styles consistent across the app
- Use custom classes defined in `globals.css`

### Backend (JavaScript/Node.js)

**File Structure**:
```javascript
// server/routes/example.js
const express = require('express');
const Model = require('../models/Model');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET endpoint
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Business logic
    const data = await Model.find();
    res.json({ data });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST endpoint
router.post('/', authMiddleware, roleMiddleware('hr_admin'), async (req, res) => {
  try {
    // Validation
    const { field1, field2 } = req.body;
    if (!field1 || !field2) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Business logic
    const item = new Model({ field1, field2 });
    await item.save();
    
    res.status(201).json({ 
      message: 'Created successfully',
      item 
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
```

**Node.js Guidelines**:
- Use CommonJS (`require`/`module.exports`) in backend
- Always use `async/await` for asynchronous operations
- Implement proper error handling with try-catch
- Use appropriate HTTP status codes

**Mongoose Models**:
```javascript
const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  // Define fields with validation
  field1: {
    type: String,
    required: true,
    trim: true,
  },
  // ... more fields
}, {
  timestamps: true, // Adds createdAt and updatedAt
});

// Add indexes
schema.index({ field1: 1 });

// Add instance methods
schema.methods.customMethod = function() {
  // Method logic
};

// Add static methods
schema.statics.customStatic = async function() {
  // Static method logic
};

module.exports = mongoose.model('ModelName', schema);
```

**API Response Format**:
```javascript
// Success responses
res.json({ data: result });
res.status(201).json({ message: 'Created', data: result });

// Error responses
res.status(400).json({ error: 'Bad request message' });
res.status(404).json({ error: 'Resource not found' });
res.status(500).json({ error: 'Internal server error' });
```

### General Code Quality

**Naming Conventions**:
- **Variables/Functions**: camelCase (`getUserData`)
- **Classes/Components**: PascalCase (`UserProfile`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)
- **Files**: Match content (PascalCase for components, camelCase for utilities)

**Comments**:
```javascript
// Good: Explain why, not what
// Calculate user progress based on completed tasks
// This triggers a recalculation of dependent fields
const progress = calculateProgress(tasks);

// Bad: Obvious comments
// Set progress to calculated value
const progress = calculateProgress(tasks);

// Complex logic should have comments
/**
 * Recursively processes task dependencies to ensure
 * tasks are completed in the correct order.
 * 
 * @param {Array} tasks - Array of task objects
 * @returns {Array} Ordered tasks
 */
function orderTasksByDependencies(tasks) {
  // Implementation
}
```

**Code Organization**:
- Keep functions small and focused
- Extract complex logic into separate functions
- Use descriptive variable and function names
- Avoid deep nesting (max 3 levels)
- DRY (Don't Repeat Yourself) principle

**Performance**:
- Optimize database queries
- Use pagination for large datasets
- Implement proper caching where appropriate
- Avoid N+1 query problems

## Commit Message Guidelines

### Format

```
type(scope): subject

body

footer
```

### Type

Must be one of:
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, missing semicolons, etc.)
- **refactor**: Code refactoring without changing functionality
- **test**: Adding or updating tests
- **chore**: Maintenance tasks (dependencies, build config, etc.)
- **perf**: Performance improvements

### Scope (Optional)

The scope should specify the part of the codebase:
- `auth`: Authentication related
- `tasks`: Task management
- `docs`: Document management
- `training`: Training modules
- `ui`: User interface
- `api`: API endpoints

### Subject

- Use imperative mood ("add feature" not "added feature")
- Don't capitalize first letter
- No period at the end
- Keep under 50 characters

### Body (Optional)

- Explain what and why (not how)
- Wrap at 72 characters

### Footer (Optional)

- Reference issues: `Closes #123` or `Fixes #456`
- Breaking changes: `BREAKING CHANGE: description`

### Examples

```bash
# Simple feature
git commit -m "feat(tasks): add task dependency support"

# Bug fix with details
git commit -m "fix(auth): resolve token expiration issue

The JWT token was expiring immediately due to incorrect
time calculation. Changed expiry time from seconds to
milliseconds.

Fixes #123"

# Documentation
git commit -m "docs: add API documentation for training endpoints"

# Breaking change
git commit -m "refactor(api): change user response format

BREAKING CHANGE: User API now returns 'firstName' and 
'lastName' separately instead of 'fullName'"
```

## Pull Request Process

### Before Submitting

1. **Test Your Changes**
   ```bash
   # Run linting
   npm run lint
   
   # Build the project
   npm run build
   
   # Start both servers and test manually
   npm run dev:all
   ```

2. **Update Documentation**
   - Update relevant markdown files
   - Add inline code comments
   - Update API documentation if needed

3. **Sync with Upstream**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

### Creating the Pull Request

1. **Title**: Clear and descriptive
   - Good: "Add email notification system for task assignments"
   - Bad: "Update code" or "Fixes"

2. **Description**: Include:
   - What: What changes you made
   - Why: Why you made them
   - How: How to test the changes
   - Screenshots: If UI changes
   - Related Issues: Link to issues

   **Template**:
   ```markdown
   ## Description
   Brief description of changes
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update
   
   ## How to Test
   1. Step-by-step testing instructions
   2. Expected behavior
   
   ## Screenshots
   (if applicable)
   
   ## Checklist
   - [ ] Code follows project conventions
   - [ ] Tests pass locally
   - [ ] Documentation updated
   - [ ] No breaking changes (or documented)
   
   ## Related Issues
   Closes #123
   ```

### Review Process

1. **Automated Checks**
   - CI/CD pipeline must pass
   - Linting must pass
   - No merge conflicts

2. **Code Review**
   - At least one maintainer approval required
   - Address all review comments
   - Make requested changes

3. **Respond to Feedback**
   - Be respectful and professional
   - Ask questions if unclear
   - Make requested changes promptly

4. **After Approval**
   - Maintainer will merge your PR
   - Delete your branch after merge

## Testing Guidelines

### Manual Testing

Before submitting a PR:

1. **Test the Happy Path**
   - Feature works as intended
   - All forms submit correctly
   - Navigation works

2. **Test Edge Cases**
   - Empty inputs
   - Very long inputs
   - Invalid data types
   - Network errors

3. **Test Different Roles**
   - New hire perspective
   - HR admin perspective
   - Manager perspective

4. **Cross-Browser Testing**
   - Test on Chrome, Firefox, Safari
   - Test on mobile devices

### Writing Tests (Future)

When adding tests:

```javascript
// Example unit test
describe('calculateProgress', () => {
  it('should return 0 when no tasks completed', () => {
    const progress = calculateProgress([], []);
    expect(progress).toBe(0);
  });
  
  it('should return 100 when all tasks completed', () => {
    const progress = calculateProgress([task1, task2], [task1, task2]);
    expect(progress).toBe(100);
  });
});
```

## Documentation

### When to Update Documentation

Update documentation when you:
- Add new features
- Change existing APIs
- Fix bugs that affect usage
- Add new configuration options
- Change deployment procedures

### Documentation Files

- `README.md`: Project overview and quick start
- `docs/API_DOCUMENTATION.md`: API endpoints
- `docs/DEVELOPER_GUIDE.md`: Development practices
- `docs/USER_GUIDE.md`: End-user instructions
- `docs/DEPLOYMENT_GUIDE.md`: Deployment instructions
- Inline comments: Complex code logic

### Documentation Style

- Use clear, simple language
- Include code examples
- Add screenshots for UI features
- Keep it up-to-date with code changes

## Community

### Getting Help

- **GitHub Issues**: Ask questions or report bugs
- **Pull Request Comments**: Discuss implementation details
- **Documentation**: Check existing docs first

### Communication

- Be patient and respectful
- Help others when you can
- Share knowledge and experiences
- Welcome new contributors

### Recognition

Contributors will be:
- Listed in the project README
- Credited in release notes
- Thanked in commit messages

## Questions?

If you have questions about contributing:

1. Check existing documentation
2. Search closed issues
3. Create a new issue with your question
4. Tag it with "question" label

Thank you for contributing to making onboarding better at Myntra! 🎉
