# SynergySphere Frontend

A modern, responsive project management dashboard built with React, TypeScript, and Tailwind CSS.

## Features

- **Modern UI/UX**: Beautiful, intuitive interface with smooth animations
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Real-time Updates**: Live task updates and notifications
- **Drag & Drop**: Kanban-style task management
- **Authentication**: Secure login with email verification and Google OAuth
- **Team Collaboration**: Project sharing and team management

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Linting**: ESLint with TypeScript support

## Installation

1. **Navigate to frontend directory**
   ```bash
   cd project/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the frontend directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_GOOGLE_CLIENT_ID=your-google-client-id
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── components/          # React components
│   ├── auth/           # Authentication related components
│   ├── dashboard/      # Dashboard components
│   ├── projects/       # Project management components
│   ├── tasks/          # Task management components
│   └── ui/             # Reusable UI components
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── context/            # React context providers
└── styles/             # Global styles
```

## Key Components

### Authentication
- `AuthForm.tsx` - Login/register form with validation
- `Verify.tsx` - Email verification component
- `GoogleButton.tsx` - Google OAuth integration

### Dashboard
- `Dashboard.tsx` - Main dashboard layout
- `ProjectDashboard.tsx` - Project overview and stats
- `MyTasks.tsx` - User's assigned tasks

### Project Management
- `ProjectDetail.tsx` - Individual project view
- `CreateProjectModal.tsx` - Project creation form
- `ProjectSettings.tsx` - Project configuration

### Task Management
- `TaskBoard.tsx` - Kanban-style task board
- `CreateTaskModal.tsx` - Task creation form
- `TaskDetailModal.tsx` - Task editing and details

### UI Components
- `FloatingInput.tsx` - Animated form inputs
- `LoadingSpinner.tsx` - Loading indicators
- `NotificationCenter.tsx` - Notification system

## Custom Hooks

### useAuth
Handles all authentication logic including:
- User login/logout
- Registration and email verification
- Google OAuth integration
- Token management
- Authentication state

```typescript
const {
  user,
  isAuthenticated,
  isLoading,
  error,
  login,
  register,
  logout,
  verifyOtp
} = useAuth();
```

## Type Definitions

### Core Types
```typescript
interface User {
  _id: string;
  name: string;
  email: string;
  provider?: string;
  isVerified?: boolean;
}

interface Project {
  _id: string;
  title: string;
  description: string;
  owner: User;
  members: User[];
  status: 'active' | 'completed' | 'on-hold' | 'cancelled';
  color: string;
  dueDate?: string;
  taskStats: TaskStats;
}

interface Task {
  _id: string;
  title: string;
  description?: string;
  project: Project | string;
  assignee?: User;
  creator: User;
  status: 'todo' | 'in-progress' | 'in-review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  tags: string[];
}
```

## Styling Guidelines

### Tailwind CSS Classes
- Use consistent spacing: `p-4`, `m-6`, `space-x-4`
- Color palette: Purple/blue gradients for primary actions
- Typography: Consistent font weights and sizes
- Responsive design: Mobile-first approach

### Component Patterns
```typescript
// Button variants
const buttonVariants = {
  primary: "bg-gradient-to-r from-purple-600 to-blue-600 text-white",
  secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
  danger: "bg-red-600 text-white hover:bg-red-700"
};

// Card layouts
const cardClasses = "bg-white rounded-xl p-6 shadow-sm border border-gray-100";
```

## State Management

The app uses React's built-in state management with:
- `useState` for component state
- `useContext` for authentication
- Custom hooks for complex logic
- Local storage for persistence

## API Integration

### API Utility
Centralized API calls with automatic token injection:

```typescript
import { api } from '../utils/api';

// GET request
const projects = await api.get('/projects');

// POST request
const newProject = await api.post('/projects', projectData);

// PUT request
const updatedTask = await api.put(`/tasks/${taskId}`, updateData);
```

## Form Validation

Using React Hook Form with Zod schemas:

```typescript
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional()
});
```

## Performance Optimizations

- **Code Splitting**: Lazy loading of components
- **Memoization**: useCallback and useMemo for expensive operations
- **Optimized Renders**: Proper dependency arrays
- **Image Optimization**: Responsive images with proper sizing

## Accessibility Features

- **Semantic HTML**: Proper heading structure and landmarks
- **ARIA Labels**: Screen reader support
- **Keyboard Navigation**: Full keyboard accessibility
- **Color Contrast**: WCAG compliant color ratios
- **Focus Management**: Proper focus indicators

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Follow the existing code style
2. Use TypeScript for all new components
3. Add proper type definitions
4. Include responsive design
5. Test on multiple screen sizes
6. Follow accessibility guidelines

## Build and Deployment

### Development
```bash
npm run dev          # Start development server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Production
```bash
npm run build        # Build for production
npm run preview      # Preview production build
```

### Environment Variables
- `VITE_API_URL`: Backend API URL
- `VITE_GOOGLE_CLIENT_ID`: Google OAuth client ID

## License

This project is licensed under the ISC License.
