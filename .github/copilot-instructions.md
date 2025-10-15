# Myntra Employee Onboarding - AI Coding Agent Instructions

## Architecture Overview

**Full-stack monorepo** with Next.js frontend (port 3000) and Express backend (port 5000) sharing the same package.json. MongoDB database runs on port 27017.

```
Frontend (Next.js/TypeScript) ←→ REST API (Express) ←→ MongoDB (Mongoose)
         Port 3000                    Port 5000            Port 27017
```

**Critical separation**: Frontend code uses TypeScript (`.tsx/.ts`) in `pages/`, `hooks/`, `utils/`. Backend uses CommonJS JavaScript (`.js`) in `server/`. Never mix ES6 imports in server code.

## Development Workflows

### Starting the application
```bash
npm run dev:all    # Both frontend + backend (recommended)
npm run server     # Backend only (nodemon auto-restart)
npm run dev        # Frontend only (Next.js)
npm run seed       # Populate DB with test users
```

**Test credentials** (after seeding):
- HR Admin: `hr@myntra.com / password123`
- Manager: `manager@myntra.com / password123`  
- New Hire: `newhire@myntra.com / password123`

### Database management
MongoDB must be running before starting the backend. Check connection status:
```bash
ps aux | grep mongod  # macOS/Linux
```

## Authentication Pattern

**JWT-based with role-based access control (RBAC)**. All auth flow follows this pattern:

1. **Frontend** (`utils/api.ts`): Token stored in `localStorage`, auto-attached to requests via axios interceptor
2. **Backend** (`server/middleware/auth.js`): Verify token, decode to `req.user = { userId, email, role }`
3. **Authorization**: Use `roleMiddleware('hr_admin', 'manager')` to restrict routes by role

**Example protected route**:
```javascript
// server/routes/tasks.js
router.post('/', authMiddleware, roleMiddleware('hr_admin', 'manager'), async (req, res) => {
  // Only HR admins and managers can create tasks
  const task = new Task({ ...req.body, assignedBy: req.user.userId });
});
```

**Frontend auth hook** (`hooks/useAuth.ts`): Centralized auth state management. Always use this hook for auth operations:
```typescript
const { user, loading, login, register, logout } = useAuth();
```

## Role System

Four distinct roles with specific permissions:

| Role | Key Abilities | Cannot Access |
|------|--------------|---------------|
| `new_hire` | Own tasks/docs/training, update profile | Other users' data, creation APIs |
| `hr_admin` | **Full access**, verify docs, assign managers/buddies, create tasks/training | None (superuser) |
| `manager` | View team progress, assign team tasks | Other departments, global stats |
| `buddy` | View mentee progress, provide guidance | Admin operations |

**When adding features**: Always check role requirements in `server/middleware/auth.js` and enforce at both route and UI levels.

## Data Models & Relationships

**User** (`server/models/User.js`):
- Auto-generates `employeeId` on registration: `MYN{timestamp-last-6-digits}`
- References: `manager` and `buddy` (both → User)
- Tracks: `onboardingProgress` (0-100%), `onboardingStatus` (pending/in_progress/completed)

**Task** (`server/models/Task.js`):
- **Auto-update pattern**: Task status changes trigger `updateOnboardingProgress()` helper
- Categories: `pre_joining`, `day_1`, `week_1`, `month_1`, `training`, `documentation`, `it_setup`, `hr_formalities`
- Supports `dependencies` array for task sequencing

**Document** (`server/models/Document.js`):
- File uploads via **Multer** middleware in `server/routes/documents.js`
- Max 5MB, types: `jpeg|jpg|png|pdf|doc|docx`
- Verification workflow: `pending` → `verified/rejected` by HR
- Files stored in `uploads/documents/` (local filesystem, extensible to S3)

**Training** (`server/models/Training.js`):
- Two separate models: `TrainingModule` (content) and `TrainingProgress` (per-user tracking)
- Quiz structure: `{ question, options: [String], correctAnswer: Number }`
- Default passing score: 70%

## API Conventions

**All routes** are under `/api` prefix. Standard REST patterns:

```javascript
GET    /api/tasks           // List (with optional ?status=completed&category=day_1)
GET    /api/tasks/:id       // Get single
POST   /api/tasks           // Create (HR/Manager only)
PATCH  /api/tasks/:id/status // Update specific field
DELETE /api/tasks/:id       // Delete (HR only)
```

**Special patterns**:
- Progress updates: `POST /api/training/:id/progress` (not PATCH)
- File uploads: `POST /api/documents/upload` (multipart/form-data)
- Stats endpoints: `GET /api/dashboard/stats` (aggregated data)

**Error handling convention**: Return `{ error: 'User-friendly message' }` with appropriate status code. Frontend displays in alert banners.

## Frontend Patterns

**Page routing** (Next.js App Router not used - using Pages Router):
- `pages/index.tsx` → Login/Register (public)
- `pages/dashboard.tsx` → Main dashboard (protected)
- No `pages/api/` directory (backend is separate Express server)

**Styling approach**: Tailwind CSS with custom utility classes in `styles/globals.css`:
- `.btn-primary` → Myntra pink buttons
- `.card` → White rounded containers with shadow
- `.badge-*` → Status indicators (success/warning/danger/info)
- Custom colors: `myntra-primary` (#ff3f6c), `myntra-accent` (#ff905a)

**Component structure**: No separate `components/` directory yet. For new features, create reusable components in `components/` and import with `@/components/...`

**Data fetching pattern**:
```typescript
// Always use API client from utils/api.ts
import { tasksAPI, dashboardAPI } from '@/utils/api';

const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await tasksAPI.getTasks();
      setData(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);
```

## Critical Business Logic

**Onboarding progress calculation** (`server/routes/tasks.js`):
```javascript
async function updateOnboardingProgress(userId) {
  const allTasks = await Task.find({ assignedTo: userId });
  const completedTasks = allTasks.filter(task => task.status === 'completed');
  const progress = Math.round((completedTasks.length / allTasks.length) * 100);
  
  await User.findByIdAndUpdate(userId, {
    onboardingProgress: progress,
    onboardingStatus: progress === 100 ? 'completed' : progress > 0 ? 'in_progress' : 'pending'
  });
}
```

**This function is called automatically** when task status changes. Don't manually update `onboardingProgress` elsewhere.

**Password hashing** (bcrypt with salt rounds 10):
- Registration: `bcrypt.hash(password, 10)`
- Login: `bcrypt.compare(plainPassword, hashedPassword)`
- **Never** store or log plain passwords

**JWT token expiry**: 7 days (`expiresIn: '7d'`). Frontend doesn't handle refresh - users re-login after expiry.

## File Upload Integration

**Backend setup** (`server/routes/documents.js`):
```javascript
const upload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/documents',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: /* jpeg|jpg|png|pdf|doc|docx */
});

router.post('/upload', authMiddleware, upload.single('document'), async (req, res) => {
  // File available in req.file
  // Additional form data in req.body
});
```

**Frontend upload** (use FormData):
```typescript
const formData = new FormData();
formData.append('document', file);
formData.append('documentType', 'pan_card');
await documentsAPI.uploadDocument(formData);
```

## Testing & Debugging

**No automated tests yet**. Manual testing checklist:
1. Start MongoDB → Start backend → Start frontend
2. Seed database with test users
3. Test each role's access permissions
4. Verify file uploads work (check `uploads/` directory)
5. Test task status changes trigger progress updates

**Common errors**:
- `MongooseServerSelectionError`: MongoDB not running
- `Port already in use`: Kill process or change port in `.env`
- `Cannot find module`: Run `npm install`
- CORS errors: Check `NEXT_PUBLIC_API_URL` in `.env`

## Environment Variables

**Critical**: `.env` is gitignored. Always provide `.env.example` template. Required variables:
```env
MONGODB_URI=mongodb://localhost:27017/myntra-onboarding
JWT_SECRET=change-in-production
PORT=5000
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

**Frontend access**: Only variables prefixed with `NEXT_PUBLIC_` are exposed to browser code.

## Code Organization Principles

1. **Backend is CommonJS**: Use `require()` and `module.exports`, never `import/export`
2. **Models = Schema + Business Logic**: Mongoose pre-save hooks in models (see `Task.js`)
3. **Routes = Thin Controllers**: Delegate complex logic to helper functions or model methods
4. **Frontend = Hooks + Pages**: Centralize shared logic in custom hooks
5. **No shared code between frontend/backend**: Separate concerns completely

## When Adding New Features

**Checklist**:
- [ ] Create/update Mongoose model in `server/models/`
- [ ] Add routes in `server/routes/` with appropriate middleware
- [ ] Export route handler in `server/index.js`
- [ ] Add API methods to `utils/api.ts`
- [ ] Create frontend page/component
- [ ] Update role permissions if needed
- [ ] Test with different user roles
- [ ] Update seed data if relevant (`server/seed.js`)

**Example: Adding a new feature**:
```javascript
// 1. Model (server/models/Feedback.js)
const feedbackSchema = new mongoose.Schema({
  userId: { type: ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5 },
});

// 2. Route (server/routes/feedback.js)
router.post('/', authMiddleware, async (req, res) => {
  const feedback = new Feedback({ ...req.body, userId: req.user.userId });
  await feedback.save();
  res.json({ feedback });
});

// 3. Register route (server/index.js)
app.use('/api/feedback', require('./routes/feedback'));

// 4. API client (utils/api.ts)
export const feedbackAPI = {
  create: (data: any) => api.post('/feedback', data),
};
```

## Known Limitations & Future Work

- File storage is local (needs S3/cloud storage for production)
- No email notifications (SMTP config exists but not implemented)
- No real-time updates (consider WebSocket for live progress)
- Frontend error handling is basic (needs toast notifications)
- No pagination on list endpoints (fine for demo, needed at scale)
- TypeScript errors in frontend due to missing type definitions (functional but should be resolved)

---

**Quick Reference Commands**:
```bash
npm run dev:all   # Start everything
npm run seed      # Reset DB with test data
mongosh           # MongoDB shell
lsof -ti:3000 | xargs kill -9  # Kill port 3000
```

For questions about requirements, see `REQUIREMENTS.md`. For setup help, see `QUICK_START.md`.
