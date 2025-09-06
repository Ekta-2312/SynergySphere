import React from 'react';
import { typography } from '../design-system/tokens';
import { ariaLabels } from '../design-system/accessibility';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
  size = 'md',
}) => {
  const sizeStyles = {
    sm: {
      container: 'py-8',
      iconSize: 'w-12 h-12',
      titleSize: typography.fontSize.lg,
      descriptionSize: typography.fontSize.sm,
    },
    md: {
      container: 'py-12',
      iconSize: 'w-16 h-16',
      titleSize: typography.fontSize.xl,
      descriptionSize: typography.fontSize.base,
    },
    lg: {
      container: 'py-16',
      iconSize: 'w-20 h-20',
      titleSize: typography.fontSize['2xl'],
      descriptionSize: typography.fontSize.lg,
    },
  };

  const currentSize = sizeStyles[size];

  return (
    <div
      className={`text-center ${currentSize.container} ${className}`}
      role="region"
      aria-label="Empty state"
    >
      {icon && (
        <div 
          className={`mx-auto ${currentSize.iconSize} text-gray-400 mb-4`}
          aria-hidden="true"
        >
          {icon}
        </div>
      )}
      
      <h3
        className="font-semibold text-gray-900 mb-2"
        style={{ fontSize: currentSize.titleSize }}
      >
        {title}
      </h3>
      
      {description && (
        <p
          className="text-gray-500 mb-6 max-w-sm mx-auto"
          style={{ fontSize: currentSize.descriptionSize }}
        >
          {description}
        </p>
      )}
      
      {action && (
        <button
          onClick={action.onClick}
          className={`
            inline-flex items-center px-4 py-2 rounded-md font-medium transition-colors
            focus:outline-none focus:ring-2 focus:ring-offset-2
            ${action.variant === 'primary'
              ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-blue-500'
            }
          `}
          type="button"
          aria-label={action.label}
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

// Specific empty state components for common scenarios
export const NoTasksEmptyState: React.FC<{
  onCreateTask?: () => void;
  showCreateButton?: boolean;
}> = ({ onCreateTask, showCreateButton = true }) => (
  <EmptyState
    icon={
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
      </svg>
    }
    title="No tasks assigned yet"
    description="Start organizing your work by creating your first task. Tasks help you track progress and stay organized."
    action={showCreateButton && onCreateTask ? {
      label: ariaLabels.task.create,
      onClick: onCreateTask,
      variant: 'primary'
    } : undefined}
    size="md"
  />
);

export const NoProjectsEmptyState: React.FC<{
  onCreateProject?: () => void;
  showCreateButton?: boolean;
}> = ({ onCreateProject, showCreateButton = true }) => (
  <EmptyState
    icon={
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z"/>
      </svg>
    }
    title="No projects yet"
    description="Create your first project to start collaborating with your team and organizing tasks."
    action={showCreateButton && onCreateProject ? {
      label: ariaLabels.project.create,
      onClick: onCreateProject,
      variant: 'primary'
    } : undefined}
    size="md"
  />
);

export const NoSearchResultsEmptyState: React.FC<{
  searchTerm?: string;
  onClearSearch?: () => void;
}> = ({ searchTerm, onClearSearch }) => (
  <EmptyState
    icon={
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
      </svg>
    }
    title={`No results found${searchTerm ? ` for "${searchTerm}"` : ''}`}
    description="Try adjusting your search criteria or browse all items."
    action={onClearSearch ? {
      label: 'Clear search',
      onClick: onClearSearch,
      variant: 'secondary'
    } : undefined}
    size="sm"
  />
);

export const ErrorEmptyState: React.FC<{
  onRetry?: () => void;
  title?: string;
  description?: string;
}> = ({ 
  onRetry, 
  title = "Something went wrong",
  description = "We encountered an error while loading this content. Please try again."
}) => (
  <EmptyState
    icon={
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
    }
    title={title}
    description={description}
    action={onRetry ? {
      label: 'Try again',
      onClick: onRetry,
      variant: 'primary'
    } : undefined}
    size="md"
  />
);

export const LoadingEmptyState: React.FC<{
  title?: string;
  description?: string;
}> = ({ 
  title = "Loading...",
  description = "Please wait while we load your content."
}) => (
  <EmptyState
    icon={
      <div className="animate-spin">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z"/>
        </svg>
      </div>
    }
    title={title}
    description={description}
    size="md"
  />
);

export default EmptyState;
