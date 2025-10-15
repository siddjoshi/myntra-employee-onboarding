# Security Documentation

## Table of Contents
- [Overview](#overview)
- [Authentication & Authorization](#authentication--authorization)
- [Data Security](#data-security)
- [Input Validation](#input-validation)
- [File Upload Security](#file-upload-security)
- [API Security](#api-security)
- [Database Security](#database-security)
- [Environment Security](#environment-security)
- [Security Best Practices](#security-best-practices)
- [Security Checklist](#security-checklist)
- [Incident Response](#incident-response)
- [Reporting Security Issues](#reporting-security-issues)

## Overview

Security is a critical aspect of the Myntra Employee Onboarding System. This document outlines the security measures implemented and best practices to follow.

### Security Principles

1. **Defense in Depth**: Multiple layers of security
2. **Least Privilege**: Users have minimum necessary access
3. **Secure by Default**: Security enabled out of the box
4. **Fail Securely**: System fails in a secure state
5. **Zero Trust**: Never trust, always verify

## Authentication & Authorization

### JWT Authentication

**Implementation**:
```javascript
// Token Generation
const token = jwt.sign(
  { 
    userId: user._id,
    email: user.email,
    role: user.role 
  },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);
```

**Security Measures**:
- **Strong Secret**: JWT_SECRET must be at least 32 characters
- **Token Expiration**: Tokens expire after 7 days
- **Payload Minimization**: Only essential data in token
- **HTTPS Only**: Tokens transmitted over HTTPS only

**Token Storage**:
- Stored in browser `localStorage`
- Included in `Authorization` header: `Bearer <token>`
- Cleared on logout

**Best Practices**:
- Never log or expose JWT secrets
- Rotate JWT secrets periodically (every 90 days)
- Use different secrets for dev/staging/production
- Generate secrets using cryptographic methods:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

### Password Security

**Hashing Algorithm**: bcrypt with 10 salt rounds

```javascript
// Password Hashing
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(password, salt);

// Password Verification
const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
```

**Password Requirements**:
- Minimum 8 characters
- Mix of uppercase and lowercase (recommended)
- Include numbers and special characters (recommended)
- No common passwords (implement password strength meter)

**Security Measures**:
- Passwords never stored in plain text
- Passwords never logged
- Password reset tokens expire after 1 hour
- Rate limiting on login attempts (prevent brute force)

### Role-Based Access Control (RBAC)

**Roles**:
1. **new_hire**: Basic access to own data
2. **buddy**: View mentee progress
3. **manager**: View and manage team members
4. **hr_admin**: Full system access

**Permission Matrix**:

| Resource | New Hire | Buddy | Manager | HR Admin |
|----------|----------|-------|---------|----------|
| View Own Profile | ✅ | ✅ | ✅ | ✅ |
| Update Own Profile | ✅ | ✅ | ✅ | ✅ |
| View Own Tasks | ✅ | ✅ | ✅ | ✅ |
| Update Own Tasks | ✅ | ✅ | ✅ | ✅ |
| View Team Tasks | ❌ | ❌ | ✅ | ✅ |
| Create Tasks | ❌ | ❌ | ✅ | ✅ |
| Delete Tasks | ❌ | ❌ | ❌ | ✅ |
| Upload Documents | ✅ | ✅ | ✅ | ✅ |
| Verify Documents | ❌ | ❌ | ❌ | ✅ |
| View Training | ✅ | ✅ | ✅ | ✅ |
| Create Training | ❌ | ❌ | ❌ | ✅ |
| View All Users | ❌ | ❌ | ✅ | ✅ |
| Manage Users | ❌ | ❌ | ❌ | ✅ |
| View Analytics | ❌ | ❌ | ✅ | ✅ |

**Implementation**:
```javascript
// Middleware for role checking
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

### Session Management

**Security Measures**:
- Token-based (stateless) sessions
- No server-side session storage
- Token expiration enforced
- Logout clears client-side token

**Best Practices**:
- Implement token refresh mechanism (future enhancement)
- Monitor for suspicious activity
- Force logout on password change
- Invalidate old tokens on role change

## Data Security

### Data Encryption

**In Transit**:
- All data transmitted over HTTPS/TLS
- TLS 1.2 or higher required
- Strong cipher suites only
- SSL certificates from trusted CA

**At Rest**:
- Database encryption (MongoDB Atlas encryption at rest)
- Environment variables encrypted
- Sensitive logs encrypted or excluded
- File storage encrypted (AWS S3 server-side encryption)

### Sensitive Data Handling

**Personal Identifiable Information (PII)**:
- Email addresses
- Phone numbers
- Physical addresses
- Emergency contact information
- Document files (Aadhaar, PAN, etc.)

**Security Measures**:
- Access logging for sensitive data
- Minimal data exposure in API responses
- Data anonymization in logs
- Regular data audits

**Data Retention**:
- Active employees: Data retained indefinitely
- Departed employees: Data retained per company policy
- Deleted accounts: Data anonymized after 90 days

### GDPR Compliance

**User Rights**:
1. **Right to Access**: Users can view their data
2. **Right to Rectification**: Users can update their data
3. **Right to Erasure**: Users can request data deletion
4. **Right to Data Portability**: Export data in JSON format

**Implementation**:
```javascript
// Export user data
router.get('/api/auth/export', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.userId).lean();
  const tasks = await Task.find({ assignedTo: req.user.userId }).lean();
  const documents = await Document.find({ userId: req.user.userId }).lean();
  const training = await TrainingProgress.find({ userId: req.user.userId }).lean();
  
  const data = { user, tasks, documents, training };
  res.json(data);
});

// Delete user data
router.delete('/api/auth/delete-account', authMiddleware, async (req, res) => {
  // Anonymize user data instead of hard delete
  await User.findByIdAndUpdate(req.user.userId, {
    email: `deleted-${req.user.userId}@deleted.com`,
    firstName: 'Deleted',
    lastName: 'User',
    phone: null,
    address: null,
    // ... anonymize other fields
  });
  
  res.json({ message: 'Account deleted successfully' });
});
```

## Input Validation

### Client-Side Validation

```typescript
// Email validation
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password strength
const isStrongPassword = (password: string): boolean => {
  return password.length >= 8 &&
         /[a-z]/.test(password) &&
         /[A-Z]/.test(password) &&
         /[0-9]/.test(password);
};

// Sanitize input
const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};
```

### Server-Side Validation

**Never trust client input - always validate on server**:

```javascript
// Mongoose schema validation
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Invalid email format'
    }
  },
  phone: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^\+?[\d\s\-()]+$/.test(v);
      },
      message: 'Invalid phone number format'
    }
  }
});

// Manual validation in route
router.post('/api/tasks', authMiddleware, async (req, res) => {
  const { title, description, dueDate } = req.body;
  
  // Validate required fields
  if (!title || !description || !dueDate) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // Validate data types
  if (typeof title !== 'string' || title.length > 200) {
    return res.status(400).json({ error: 'Invalid title' });
  }
  
  // Validate date
  if (new Date(dueDate) < new Date()) {
    return res.status(400).json({ error: 'Due date must be in the future' });
  }
  
  // Proceed with task creation
});
```

### XSS Prevention

**Measures**:
- Sanitize all user input
- Escape output in templates
- Use Content Security Policy (CSP) headers
- Avoid `dangerouslySetInnerHTML` in React

```javascript
// Express middleware for XSS protection
const xss = require('xss-clean');
app.use(xss());

// Content Security Policy
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
  );
  next();
});
```

### SQL/NoSQL Injection Prevention

**MongoDB Protection**:
- Use Mongoose schema validation
- Avoid string concatenation in queries
- Use parameterized queries

```javascript
// UNSAFE - vulnerable to injection
const email = req.body.email;
const user = await User.findOne({ email: email });

// SAFE - Mongoose handles sanitization
const { email } = req.body;
const user = await User.findOne({ email });

// Additional sanitization
const mongoSanitize = require('express-mongo-sanitize');
app.use(mongoSanitize());
```

## File Upload Security

### File Type Validation

```javascript
const multer = require('multer');
const path = require('path');

const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
  
  // Check extension
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  
  // Check mime type
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, PDF, DOC, and DOCX allowed.'));
  }
};

const upload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/documents',
    filename: (req, file, cb) => {
      // Generate unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: fileFilter
});
```

### File Storage Security

**Local Storage**:
- Store outside web root if possible
- Use unique, unpredictable filenames
- Set proper file permissions (644 for files, 755 for directories)
- Serve files through application (not direct access)

```javascript
// Secure file serving
router.get('/documents/:filename', authMiddleware, async (req, res) => {
  const { filename } = req.params;
  
  // Check if user has access to this file
  const document = await Document.findOne({ 
    fileName: filename,
    userId: req.user.userId 
  });
  
  if (!document) {
    return res.status(404).json({ error: 'File not found' });
  }
  
  // Serve file
  const filePath = path.join(__dirname, '../uploads/documents', filename);
  res.sendFile(filePath);
});
```

**Cloud Storage (AWS S3)**:
- Use private buckets (not public)
- Generate signed URLs for temporary access
- Set proper CORS policies
- Enable server-side encryption

```javascript
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

// Generate signed URL for temporary access
const getSignedUrl = (key) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Expires: 3600, // 1 hour
  };
  
  return s3.getSignedUrl('getObject', params);
};

// Use signed URL in API
router.get('/documents/:id', authMiddleware, async (req, res) => {
  const document = await Document.findById(req.params.id);
  
  // Check authorization
  if (document.userId.toString() !== req.user.userId) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  const signedUrl = getSignedUrl(document.fileKey);
  res.json({ url: signedUrl });
});
```

### Virus Scanning

**Recommended**: Implement antivirus scanning for uploaded files

```javascript
// Using ClamAV or similar
const NodeClam = require('clamscan');

const clamscan = new NodeClam().init({
  clamdscan: {
    host: 'localhost',
    port: 3310,
  },
});

router.post('/upload', upload.single('document'), async (req, res) => {
  try {
    // Scan file for viruses
    const { isInfected, viruses } = await clamscan.scanFile(req.file.path);
    
    if (isInfected) {
      // Delete infected file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ 
        error: 'File is infected with virus',
        viruses 
      });
    }
    
    // Proceed with upload
    // ...
  } catch (error) {
    res.status(500).json({ error: 'File scan failed' });
  }
});
```

## API Security

### Rate Limiting

**Prevent Brute Force and DDoS Attacks**:

```javascript
const rateLimit = require('express-rate-limit');

// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

app.use('/api/', apiLimiter);

// Stricter limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 login attempts per 15 minutes
  skipSuccessfulRequests: true,
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
```

### CORS Configuration

**Restrict Cross-Origin Requests**:

```javascript
const cors = require('cors');

const corsOptions = {
  origin: function (origin, callback) {
    const whitelist = [
      'https://onboarding.myntra.com',
      'http://localhost:3000', // Development only
    ];
    
    if (process.env.NODE_ENV === 'development' || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
```

### HTTP Security Headers

```javascript
const helmet = require('helmet');

app.use(helmet());

// Custom security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});
```

### API Authentication

**Always verify authentication**:

```javascript
// Authentication middleware
const authMiddleware = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.substring(7);
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user info to request
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Use on protected routes
router.get('/api/tasks', authMiddleware, getTasks);
```

## Database Security

### MongoDB Security

**Connection Security**:
```javascript
// Use MongoDB connection string with authentication
const uri = `mongodb+srv://${username}:${password}@cluster.mongodb.net/${dbname}?retryWrites=true&w=majority`;

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // Additional security options
  ssl: true,
  sslValidate: true,
});
```

**Access Control**:
- Use dedicated database user (not admin)
- Grant minimum required permissions
- Use strong passwords
- Rotate credentials regularly

**Network Security**:
- Whitelist IP addresses (MongoDB Atlas)
- Use VPC/Private networking in cloud
- Enable firewall rules

**Audit Logging**:
- Enable MongoDB audit logs
- Monitor for suspicious queries
- Track access patterns

### Query Security

**Prevent Injection**:
```javascript
// SAFE - Using Mongoose models
const user = await User.findOne({ email: req.body.email });

// SAFE - Using Mongoose methods
const tasks = await Task.find({ assignedTo: userId });

// UNSAFE - Raw query construction
const query = `{ email: "${req.body.email}" }`;
const user = await db.collection('users').findOne(JSON.parse(query));
```

**Optimize Queries**:
```javascript
// Use indexes
userSchema.index({ email: 1 });
taskSchema.index({ assignedTo: 1, status: 1 });

// Use projection to limit returned fields
const user = await User.findById(userId).select('firstName lastName email');

// Use lean() for read-only data
const tasks = await Task.find({}).lean();
```

## Environment Security

### Environment Variables

**Never Commit Secrets**:
- Add `.env` to `.gitignore`
- Provide `.env.example` template
- Use different values for dev/staging/prod

**Example `.env.example`**:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/myntra-onboarding

# JWT Secret (CHANGE IN PRODUCTION)
JWT_SECRET=change-this-to-a-strong-random-string-in-production

# Server
PORT=5000
NODE_ENV=development

# AWS (if using S3)
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_REGION=ap-south-1
AWS_BUCKET_NAME=your-bucket-name
```

**Secrets Management**:
- Use environment-specific secrets
- Rotate secrets regularly
- Use secret management services:
  - AWS Secrets Manager
  - HashiCorp Vault
  - Azure Key Vault

## Security Best Practices

### Development

1. **Keep Dependencies Updated**
   ```bash
   # Check for vulnerabilities
   npm audit
   
   # Fix vulnerabilities
   npm audit fix
   
   # Update packages
   npm update
   ```

2. **Code Review**
   - Require code reviews for all changes
   - Check for security issues
   - Validate input handling
   - Review authentication/authorization

3. **Static Analysis**
   ```bash
   # Use ESLint with security plugins
   npm install --save-dev eslint-plugin-security
   ```

4. **Secrets Scanning**
   - Never commit secrets to git
   - Use git-secrets or similar tools
   - Scan commits for exposed secrets

### Production

1. **HTTPS Only**
   - Enforce HTTPS for all connections
   - Redirect HTTP to HTTPS
   - Use HSTS headers

2. **Logging and Monitoring**
   - Log security events
   - Monitor for suspicious activity
   - Set up alerts for security issues
   - Use tools like Sentry, DataDog, etc.

3. **Regular Backups**
   - Automated daily backups
   - Test restore procedures
   - Encrypt backups
   - Store offsite

4. **Incident Response Plan**
   - Document response procedures
   - Define roles and responsibilities
   - Test the plan regularly

## Security Checklist

### Pre-Deployment

- [ ] All secrets in environment variables
- [ ] JWT_SECRET is strong and unique
- [ ] Database has proper authentication
- [ ] HTTPS/TLS configured
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] File upload restrictions in place
- [ ] SQL injection prevention verified
- [ ] XSS protection enabled
- [ ] Security headers configured
- [ ] Dependencies audit passed
- [ ] Sensitive data not logged
- [ ] Error messages don't expose internals
- [ ] Backup procedures tested

### Post-Deployment

- [ ] Monitor logs for security events
- [ ] Review access logs regularly
- [ ] Check for vulnerabilities monthly
- [ ] Update dependencies regularly
- [ ] Rotate secrets quarterly
- [ ] Audit user access permissions
- [ ] Test backup recovery
- [ ] Review security incidents

## Incident Response

### Security Incident Procedure

1. **Detect and Identify**
   - Monitor alerts and logs
   - Identify type and severity
   - Document initial findings

2. **Contain**
   - Isolate affected systems
   - Revoke compromised credentials
   - Block malicious IP addresses

3. **Investigate**
   - Determine root cause
   - Identify affected data/users
   - Document timeline

4. **Remediate**
   - Fix vulnerabilities
   - Update security measures
   - Deploy patches

5. **Notify**
   - Inform affected users
   - Report to authorities if required
   - Update stakeholders

6. **Review and Learn**
   - Post-incident analysis
   - Update security procedures
   - Implement preventive measures

## Reporting Security Issues

### How to Report

If you discover a security vulnerability:

1. **Do NOT** create a public GitHub issue
2. **Email**: security@myntra.com
3. **Include**:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect

- **Acknowledgment**: Within 24 hours
- **Initial Assessment**: Within 48 hours
- **Regular Updates**: Every 5-7 days
- **Resolution**: Varies by severity
- **Credit**: Recognition for responsible disclosure

### Bug Bounty (Future)

We may implement a bug bounty program to reward security researchers who help improve our security.

---

**Security is everyone's responsibility**. If you see something, say something. Help us keep the Myntra Employee Onboarding System secure!

For questions about security, contact: security@myntra.com
