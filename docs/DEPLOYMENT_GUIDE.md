# Deployment Guide

## Table of Contents
- [Overview](#overview)
- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Environment Configuration](#environment-configuration)
- [Deployment Options](#deployment-options)
- [Database Setup](#database-setup)
- [File Storage Setup](#file-storage-setup)
- [Monitoring and Logging](#monitoring-and-logging)
- [Post-Deployment Tasks](#post-deployment-tasks)
- [Backup and Recovery](#backup-and-recovery)
- [Scaling](#scaling)
- [Rollback Procedures](#rollback-procedures)

## Overview

This guide covers deploying the Myntra Employee Onboarding application to production environments. The application can be deployed using various strategies, from simple single-server deployments to sophisticated multi-region setups.

### Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Production Setup                       │
├─────────────────────────────────────────────────────────┤
│  Frontend: Vercel/Netlify (Next.js)                    │
│  Backend: Railway/Heroku/AWS (Express.js)              │
│  Database: MongoDB Atlas (Managed)                      │
│  File Storage: AWS S3 / Google Cloud Storage           │
│  CDN: CloudFlare / AWS CloudFront                       │
│  Monitoring: Sentry / DataDog / New Relic              │
└─────────────────────────────────────────────────────────┘
```

## Pre-Deployment Checklist

### Code Preparation

- [ ] All tests pass locally
- [ ] Code linting passes without errors
- [ ] Environment variables documented
- [ ] Dependencies updated and audited
- [ ] Security vulnerabilities fixed
- [ ] Performance optimization completed
- [ ] API documentation updated
- [ ] Database migrations prepared
- [ ] Backup procedures tested

### Security Checklist

- [ ] Strong JWT secret configured
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] SQL injection prevention verified
- [ ] XSS protection enabled
- [ ] HTTPS/TLS certificates configured
- [ ] Environment secrets secured
- [ ] File upload restrictions enforced
- [ ] Authentication tokens properly managed

### Infrastructure Checklist

- [ ] Domain name registered and configured
- [ ] SSL/TLS certificates obtained
- [ ] CDN configured
- [ ] Monitoring tools set up
- [ ] Log aggregation configured
- [ ] Backup strategy implemented
- [ ] Disaster recovery plan documented
- [ ] Scaling strategy defined

## Environment Configuration

### Production Environment Variables

Create a `.env.production` file (never commit this to git):

```env
# Application
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/myntra-onboarding?retryWrites=true&w=majority

# JWT Secret (use strong random string)
JWT_SECRET=your-super-secret-production-jwt-key-minimum-32-characters

# Frontend URL
FRONTEND_URL=https://onboarding.myntra.com
NEXT_PUBLIC_API_URL=https://api.onboarding.myntra.com/api

# AWS S3 (for file storage)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=ap-south-1
AWS_BUCKET_NAME=myntra-onboarding-documents

# Email Service (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@myntra.com
SMTP_PASSWORD=your-smtp-password
EMAIL_FROM=noreply@myntra.com

# Monitoring
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Generating Secure JWT Secret

```bash
# Generate random 32-character string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use OpenSSL
openssl rand -base64 32
```

## Deployment Options

### Option 1: Vercel (Frontend) + Railway (Backend) + MongoDB Atlas

This is the recommended approach for quick deployment with minimal DevOps overhead.

#### Step 1: Deploy Backend to Railway

1. **Sign up for Railway**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create New Project**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login
   railway login
   
   # Initialize project
   railway init
   ```

3. **Configure Environment Variables**
   - Go to Railway dashboard
   - Select your project
   - Navigate to Variables tab
   - Add all production environment variables

4. **Deploy**
   ```bash
   # Link to Railway project
   railway link
   
   # Deploy
   railway up
   ```

5. **Get Backend URL**
   - Railway will provide a URL like: `https://your-app.railway.app`

#### Step 2: Set Up MongoDB Atlas

1. **Create Account**
   - Go to https://cloud.mongodb.com
   - Sign up for free tier

2. **Create Cluster**
   - Click "Build a Cluster"
   - Choose cloud provider (AWS recommended)
   - Select region (closest to your users)
   - Choose free tier or paid plan

3. **Configure Security**
   ```
   Security > Database Access:
   - Create database user with strong password
   - Set read/write privileges
   
   Security > Network Access:
   - Add IP whitelist: 0.0.0.0/0 (allow from anywhere)
   - Or specific IP addresses for better security
   ```

4. **Get Connection String**
   ```
   Connect > Connect your application
   Copy connection string:
   mongodb+srv://<username>:<password>@cluster.mongodb.net/myntra-onboarding
   ```

5. **Update Backend Environment Variables**
   - Add MONGODB_URI to Railway environment variables

#### Step 3: Deploy Frontend to Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Configure Environment Variables**
   Create `vercel.json`:
   ```json
   {
     "env": {
       "NEXT_PUBLIC_API_URL": "https://your-backend.railway.app/api"
     }
   }
   ```

4. **Deploy**
   ```bash
   # Deploy to production
   vercel --prod
   ```

5. **Configure Custom Domain** (Optional)
   ```bash
   # Add custom domain
   vercel domains add onboarding.myntra.com
   
   # Configure DNS
   # Add CNAME record: onboarding -> cname.vercel-dns.com
   ```

### Option 2: Docker Deployment

#### Create Dockerfiles

**Backend Dockerfile** (`Dockerfile.backend`):
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy server code
COPY server ./server
COPY uploads ./uploads

# Expose port
EXPOSE 5000

# Start server
CMD ["node", "server/index.js"]
```

**Frontend Dockerfile** (`Dockerfile.frontend`):
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build Next.js app
RUN npm run build

# Production image
FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["npm", "start"]
```

#### Docker Compose

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6
    container_name: myntra-onboarding-db
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ROOT_PASSWORD}
      MONGO_INITDB_DATABASE: myntra-onboarding
    volumes:
      - mongo-data:/data/db
    ports:
      - "27017:27017"
    networks:
      - myntra-network

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    container_name: myntra-onboarding-backend
    restart: always
    environment:
      NODE_ENV: production
      PORT: 5000
      MONGODB_URI: mongodb://admin:${MONGO_ROOT_PASSWORD}@mongodb:27017/myntra-onboarding?authSource=admin
      JWT_SECRET: ${JWT_SECRET}
      FRONTEND_URL: ${FRONTEND_URL}
    ports:
      - "5000:5000"
    depends_on:
      - mongodb
    networks:
      - myntra-network
    volumes:
      - ./uploads:/app/uploads

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    container_name: myntra-onboarding-frontend
    restart: always
    environment:
      NEXT_PUBLIC_API_URL: ${BACKEND_URL}/api
    ports:
      - "3000:3000"
    depends_on:
      - backend
    networks:
      - myntra-network

  nginx:
    image: nginx:alpine
    container_name: myntra-onboarding-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
    networks:
      - myntra-network

volumes:
  mongo-data:

networks:
  myntra-network:
    driver: bridge
```

#### Nginx Configuration

Create `nginx.conf`:
```nginx
events {
    worker_connections 1024;
}

http {
    upstream frontend {
        server frontend:3000;
    }

    upstream backend {
        server backend:5000;
    }

    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name onboarding.myntra.com;
        return 301 https://$server_name$request_uri;
    }

    # Frontend
    server {
        listen 443 ssl http2;
        server_name onboarding.myntra.com;

        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;

        location / {
            proxy_pass http://frontend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }

    # Backend API
    server {
        listen 443 ssl http2;
        server_name api.onboarding.myntra.com;

        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;

        location / {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

#### Deploy with Docker Compose

```bash
# Create .env file with production values
cp .env.example .env.production

# Build and start containers
docker-compose --env-file .env.production up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down

# Rebuild after changes
docker-compose up -d --build
```

### Option 3: AWS Deployment

#### Architecture on AWS

```
┌─────────────────────────────────────────────────────────┐
│                     AWS Cloud                            │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  CloudFront CDN ──> S3 (Static Assets)                 │
│         │                                                │
│         ├──> ALB (Application Load Balancer)           │
│         │     │                                          │
│         │     ├──> ECS/EC2 (Frontend - Next.js)        │
│         │     │                                          │
│         │     └──> ECS/EC2 (Backend - Express)         │
│         │              │                                 │
│         │              └──> DocumentDB/MongoDB Atlas    │
│         │                                                │
│         └──> S3 (File Uploads)                          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

#### AWS Services Needed

1. **EC2 / ECS**: Application hosting
2. **RDS / DocumentDB**: Database (or use MongoDB Atlas)
3. **S3**: File storage and static assets
4. **CloudFront**: CDN for static content
5. **ALB**: Load balancing
6. **Route 53**: DNS management
7. **Certificate Manager**: SSL/TLS certificates
8. **CloudWatch**: Monitoring and logging

#### Deployment Steps

1. **Set Up VPC and Security Groups**
   ```bash
   # Create VPC
   aws ec2 create-vpc --cidr-block 10.0.0.0/16
   
   # Create security groups for backend, frontend, and database
   aws ec2 create-security-group --group-name backend-sg --description "Backend security group"
   ```

2. **Deploy Database**
   ```bash
   # Option 1: Use MongoDB Atlas (recommended)
   # Follow MongoDB Atlas setup above
   
   # Option 2: Use AWS DocumentDB
   aws docdb create-db-cluster \
     --db-cluster-identifier myntra-onboarding \
     --engine docdb \
     --master-username admin \
     --master-user-password <password>
   ```

3. **Set Up S3 for File Storage**
   ```bash
   # Create S3 bucket
   aws s3 mb s3://myntra-onboarding-files
   
   # Configure bucket policy for private access
   aws s3api put-bucket-policy --bucket myntra-onboarding-files --policy file://s3-policy.json
   ```

4. **Deploy Application to EC2**
   ```bash
   # Launch EC2 instance
   aws ec2 run-instances \
     --image-id ami-xxxxx \
     --instance-type t3.medium \
     --key-name my-key-pair \
     --security-group-ids sg-xxxxx
   
   # SSH into instance
   ssh -i my-key-pair.pem ec2-user@<public-ip>
   
   # Install Node.js and dependencies
   curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
   sudo yum install -y nodejs git
   
   # Clone and deploy application
   git clone https://github.com/siddjoshi/myntra-employee-onboarding.git
   cd myntra-employee-onboarding
   npm install
   npm run build
   
   # Use PM2 for process management
   npm install -g pm2
   pm2 start server/index.js --name backend
   pm2 start npm --name frontend -- start
   pm2 startup
   pm2 save
   ```

5. **Configure Load Balancer**
   ```bash
   # Create application load balancer
   aws elbv2 create-load-balancer \
     --name myntra-onboarding-alb \
     --subnets subnet-xxxxx subnet-yyyyy \
     --security-groups sg-xxxxx
   
   # Create target groups for frontend and backend
   aws elbv2 create-target-group \
     --name backend-targets \
     --protocol HTTP \
     --port 5000 \
     --vpc-id vpc-xxxxx
   ```

## Database Setup

### MongoDB Atlas Production Configuration

1. **Performance Tier**
   - M10 or higher for production
   - Enable auto-scaling
   - Configure read replicas

2. **Backup Configuration**
   ```
   Backup > Cloud Provider Snapshots:
   - Enable continuous backups
   - Set retention policy (7 days recommended)
   - Configure point-in-time recovery
   ```

3. **Monitoring**
   ```
   Monitoring > Alerts:
   - Set up alerts for:
     * High connection count
     * Low available connections
     * Replication lag
     * Disk usage
   ```

4. **Performance Optimization**
   ```javascript
   // Create indexes
   db.users.createIndex({ email: 1 }, { unique: true });
   db.tasks.createIndex({ assignedTo: 1, status: 1 });
   db.documents.createIndex({ userId: 1, status: 1 });
   db.trainingprogresses.createIndex({ userId: 1, moduleId: 1 }, { unique: true });
   ```

### Database Migration

```javascript
// server/scripts/migrate.js
const mongoose = require('mongoose');
require('dotenv').config();

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');
    
    // Add your migration logic here
    // Example: Add new field to existing documents
    const result = await db.collection('users').updateMany(
      { newField: { $exists: false } },
      { $set: { newField: 'default_value' } }
    );
    
    console.log(`Updated ${result.modifiedCount} documents`);
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
```

## File Storage Setup

### AWS S3 Configuration

1. **Create S3 Bucket**
   ```bash
   aws s3 mb s3://myntra-onboarding-documents
   ```

2. **Configure Bucket Policy**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "AllowBackendAccess",
         "Effect": "Allow",
         "Principal": {
           "AWS": "arn:aws:iam::account-id:user/backend-user"
         },
         "Action": [
           "s3:GetObject",
           "s3:PutObject",
           "s3:DeleteObject"
         ],
         "Resource": "arn:aws:s3:::myntra-onboarding-documents/*"
       }
     ]
   }
   ```

3. **Configure CORS**
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedOrigins": ["https://onboarding.myntra.com"],
       "ExposeHeaders": ["ETag"]
     }
   ]
   ```

4. **Update Backend Code**
   ```javascript
   // server/config/aws.js
   const AWS = require('aws-sdk');
   
   AWS.config.update({
     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
     region: process.env.AWS_REGION,
   });
   
   const s3 = new AWS.S3();
   
   module.exports = { s3 };
   ```
   
   ```javascript
   // server/routes/documents.js
   const { s3 } = require('../config/aws');
   
   router.post('/upload', authMiddleware, async (req, res) => {
     const params = {
       Bucket: process.env.AWS_BUCKET_NAME,
       Key: `documents/${Date.now()}-${req.file.originalname}`,
       Body: req.file.buffer,
       ContentType: req.file.mimetype,
     };
     
     const result = await s3.upload(params).promise();
     
     // Save document record in database
     const document = new Document({
       userId: req.user.userId,
       fileUrl: result.Location,
       // ... other fields
     });
     
     await document.save();
     res.json({ document });
   });
   ```

## Monitoring and Logging

### Set Up Sentry for Error Tracking

1. **Install Sentry**
   ```bash
   npm install @sentry/node @sentry/nextjs
   ```

2. **Configure Backend**
   ```javascript
   // server/index.js
   const Sentry = require('@sentry/node');
   
   Sentry.init({
     dsn: process.env.SENTRY_DSN,
     environment: process.env.NODE_ENV,
   });
   
   // Error handler middleware
   app.use(Sentry.Handlers.errorHandler());
   ```

3. **Configure Frontend**
   ```javascript
   // pages/_app.tsx
   import * as Sentry from '@sentry/nextjs';
   
   Sentry.init({
     dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
     environment: process.env.NODE_ENV,
   });
   ```

### CloudWatch Logs (AWS)

```javascript
// server/config/logger.js
const winston = require('winston');
const CloudWatchTransport = require('winston-cloudwatch');

const logger = winston.createLogger({
  transports: [
    new CloudWatchTransport({
      logGroupName: 'myntra-onboarding',
      logStreamName: 'backend-logs',
      awsRegion: process.env.AWS_REGION,
    }),
  ],
});

module.exports = logger;
```

### Health Check Endpoint

```javascript
// server/index.js
app.get('/api/health', async (req, res) => {
  const health = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    status: 'OK',
    database: 'disconnected',
    version: process.env.npm_package_version,
  };
  
  try {
    await mongoose.connection.db.admin().ping();
    health.database = 'connected';
  } catch (error) {
    health.database = 'disconnected';
    health.status = 'ERROR';
  }
  
  const statusCode = health.status === 'OK' ? 200 : 503;
  res.status(statusCode).json(health);
});
```

## Post-Deployment Tasks

### 1. Verify Deployment

```bash
# Check frontend
curl https://onboarding.myntra.com

# Check backend health
curl https://api.onboarding.myntra.com/api/health

# Check database connectivity
curl -X POST https://api.onboarding.myntra.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@myntra.com","password":"password123"}'
```

### 2. Set Up Monitoring Alerts

**Uptime Monitoring**:
- Use UptimeRobot or Pingdom
- Monitor: `/api/health` endpoint
- Alert if down for > 2 minutes

**Error Rate Monitoring**:
- Set up Sentry alerts
- Alert if error rate > 1% of requests

**Performance Monitoring**:
- Monitor API response times
- Alert if average response time > 500ms

### 3. Configure Backups

```bash
# MongoDB Atlas automated backups are enabled by default

# Manual backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="$MONGODB_URI" --out="backup_$DATE"
tar -czf "backup_$DATE.tar.gz" "backup_$DATE"
aws s3 cp "backup_$DATE.tar.gz" s3://myntra-backups/
```

### 4. Set Up CI/CD Pipeline

**GitHub Actions** (`.github/workflows/deploy.yml`):
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build frontend
        run: npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
      
      - name: Deploy backend to Railway
        run: |
          npm install -g @railway/cli
          railway up --service backend
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

## Backup and Recovery

### Backup Strategy

1. **Database Backups**
   - Automated daily backups (MongoDB Atlas)
   - 7-day retention for point-in-time recovery
   - Monthly full backups stored in S3

2. **File Storage Backups**
   - S3 versioning enabled
   - Cross-region replication for disaster recovery

3. **Code Backups**
   - Git repository (GitHub)
   - Tagged releases for each deployment

### Recovery Procedures

**Database Recovery**:
```bash
# Restore from MongoDB Atlas snapshot
# 1. Go to MongoDB Atlas dashboard
# 2. Select Backups
# 3. Choose snapshot date
# 4. Click "Restore"

# Or restore from manual backup
mongorestore --uri="$MONGODB_URI" --drop backup_20251015_120000/
```

**Application Recovery**:
```bash
# Rollback to previous version
git checkout v1.0.0
vercel --prod
railway up
```

## Scaling

### Horizontal Scaling

**Frontend (Next.js)**:
- Vercel handles auto-scaling automatically
- Or use AWS Auto Scaling Groups with EC2

**Backend (Express)**:
- Deploy multiple instances behind load balancer
- Use PM2 cluster mode for single server
- Or use Kubernetes for advanced orchestration

### Vertical Scaling

- Upgrade server instance types
- Increase memory and CPU allocation
- Optimize database tier

### Database Scaling

- Enable MongoDB Atlas auto-scaling
- Use read replicas for read-heavy workloads
- Implement caching with Redis

### Caching Strategy

```javascript
// Implement Redis caching
const redis = require('redis');
const client = redis.createClient({
  url: process.env.REDIS_URL,
});

// Cache middleware
const cacheMiddleware = (duration) => {
  return async (req, res, next) => {
    const key = `cache:${req.originalUrl}`;
    const cached = await client.get(key);
    
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    
    res.sendResponse = res.json;
    res.json = (body) => {
      client.setex(key, duration, JSON.stringify(body));
      res.sendResponse(body);
    };
    
    next();
  };
};

// Use in routes
app.get('/api/dashboard/stats', cacheMiddleware(300), getStats);
```

## Rollback Procedures

### Quick Rollback Steps

1. **Identify Issue**
   - Check error logs in Sentry
   - Monitor metrics in dashboards
   - User reports

2. **Rollback Frontend**
   ```bash
   # Vercel
   vercel rollback <deployment-url>
   
   # Or redeploy previous version
   git checkout v1.0.0
   vercel --prod
   ```

3. **Rollback Backend**
   ```bash
   # Railway
   railway rollback
   
   # Or Docker
   docker-compose down
   docker-compose up -d --build v1.0.0
   ```

4. **Database Rollback** (if needed)
   ```bash
   # Restore from backup
   mongorestore --uri="$MONGODB_URI" --drop backup_before_deployment/
   ```

5. **Verify Rollback**
   ```bash
   # Check health endpoint
   curl https://api.onboarding.myntra.com/api/health
   
   # Test critical functionality
   curl -X POST https://api.onboarding.myntra.com/api/auth/login ...
   ```

6. **Communication**
   - Notify team of rollback
   - Update status page
   - Investigate root cause

---

For more information, refer to:
- [Architecture Documentation](./ARCHITECTURE.md)
- [Developer Guide](./DEVELOPER_GUIDE.md)
- [Security Documentation](./SECURITY.md)
