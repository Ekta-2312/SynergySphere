import { Task } from '../types/auth';

// Helper function to calculate progress percentage based on task status
export const calculateProgressPercentage = (tasks: Task[]): number => {
  if (tasks.length === 0) return 0;

  let totalProgress = 0;

  tasks.forEach(task => {
    switch (task.status) {
      case 'todo':
        totalProgress += 0; // 0%
        break;
      case 'in-progress':
        totalProgress += 25; // 25%
        break;
      case 'in-review':
        totalProgress += 75; // 75%
        break;
      case 'done':
        totalProgress += 100; // 100%
        break;
      default:
        totalProgress += 0;
    }
  });

  return Math.round(totalProgress / tasks.length);
};

// Get status progress value for individual tasks
export const getStatusProgress = (status: string): number => {
  switch (status) {
    case 'todo':
      return 0;
    case 'in-progress':
      return 25;
    case 'in-review':
      return 75;
    case 'done':
      return 100;
    default:
      return 0;
  }
};

// Get status color based on progress
export const getProgressColor = (percentage: number): string => {
  if (percentage >= 75) return 'from-green-500 to-emerald-500';
  if (percentage >= 50) return 'from-yellow-500 to-orange-500';
  if (percentage >= 25) return 'from-blue-500 to-purple-500';
  return 'from-gray-400 to-gray-500';
};
