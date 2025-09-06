export interface User {
  _id: string;
  name: string;
  email: string;
  provider?: string;
  isVerified?: boolean;
  createdAt?: string;
}

export interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signup: (
    name: string,
    email: string,
    password: string,
    confirmPassword: string
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  loading: boolean;
}

// Project Management Types
export interface Project {
  _id: string;
  title: string;
  name: string;
  description: string;
  owner: User;
  members: User[];
  tasks?: Task[];
  status: 'active' | 'completed' | 'on-hold' | 'cancelled';
  color: string;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
  projectManager?: User;
  image?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  taskStats: {
    total: number;
    completed: number;
    completionPercentage: number;
  };
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  project: Project | string;
  assignee?: User;
  creator: User;
  status: 'todo' | 'in-progress' | 'in-review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  completedAt?: string;
  attachments?: Array<{
    filename: string;
    url: string;
    uploadedAt: string;
  }>;
  tags: string[];
  estimatedHours?: number;
  actualHours?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Discussion {
  _id: string;
  project: Project | string;
  title?: string;
  author: User;
  content: string;
  parentDiscussion?: string;
  replies: Discussion[];
  attachments?: Array<{
    filename: string;
    url: string;
    uploadedAt: string;
  }>;
  reactions: Array<{
    user: string;
    type: 'like' | 'love' | 'laugh' | 'angry' | 'sad';
  }>;
  isPinned: boolean;
  isResolved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  _id: string;
  recipient: string;
  sender?: User;
  type:
    | 'task_assigned'
    | 'task_completed'
    | 'task_due_soon'
    | 'project_invitation'
    | 'discussion_reply'
    | 'project_update'
    | 'deadline_reminder';
  title: string;
  message: string;
  relatedProject?: Project;
  relatedTask?: Task;
  relatedDiscussion?: Discussion;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface TaskStats {
  totalTasks: number;
  myTasks: number;
  completedTasks: number;
  overdueTasks: number;
  totalProjects: number;
}
