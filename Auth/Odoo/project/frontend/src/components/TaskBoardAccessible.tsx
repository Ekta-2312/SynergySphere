import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Project, Task } from '../types/auth';
import { CreateTaskModalEnhanced } from './CreateTaskModalEnhanced';
import { TaskDetailModal } from './TaskDetailModal';
import { NoTasksEmptyState } from './EmptyState';
import { api } from '../utils/api';
import { colors } from '../design-system/tokens';
import { 
  ariaLabels, 
  keyboardKeys, 
  ariaAttributes
} from '../design-system/accessibility';

interface TaskBoardProps {
  project: Project;
  tasks: Task[];
  onTaskUpdate: (task: Task) => void;
  onTaskCreate: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
}

const statusColumns = [
  { 
    id: 'todo', 
    title: 'To Do', 
    color: colors.status.todo.bg,
    description: 'Tasks that need to be started'
  },
  { 
    id: 'in-progress', 
    title: 'In Progress', 
    color: colors.status['in-progress'].bg,
    description: 'Tasks currently being worked on'
  },
  { 
    id: 'in-review', 
    title: 'In Review', 
    color: colors.status['in-review'].bg,
    description: 'Tasks waiting for review'
  },
  { 
    id: 'done', 
    title: 'Done', 
    color: colors.status.done.bg,
    description: 'Completed tasks'
  },
];

export const TaskBoardAccessible: React.FC<TaskBoardProps> = ({
  project,
  tasks,
  onTaskUpdate,
  onTaskCreate,
  onTaskDelete,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [focusedColumn, setFocusedColumn] = useState(0);
  const [focusedTaskIndex, setFocusedTaskIndex] = useState(0);
  const [announcementText, setAnnouncementText] = useState('');
  
  const boardRef = useRef<HTMLDivElement>(null);
  const columnRefs = useRef<(HTMLDivElement | null)[]>([]);
  const taskRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Announce changes to screen readers
  const announce = useCallback((message: string) => {
    setAnnouncementText(message);
    setTimeout(() => setAnnouncementText(''), 1000);
  }, []);

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  const getPriorityColor = (priority: string) => {
    const priorityColors = colors.priority[priority as keyof typeof colors.priority];
    if (priorityColors) {
      return `bg-[${priorityColors.bg}] text-[${priorityColors.text}] border-[${priorityColors.border}]`;
    }
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const currentColumn = statusColumns[focusedColumn];
    const currentTasks = getTasksByStatus(currentColumn.id);

    switch (e.key) {
      case keyboardKeys.ARROW_LEFT:
        e.preventDefault();
        if (focusedColumn > 0) {
          setFocusedColumn(focusedColumn - 1);
          setFocusedTaskIndex(0);
          announce(`Moved to ${statusColumns[focusedColumn - 1].title} column`);
        }
        break;

      case keyboardKeys.ARROW_RIGHT:
        e.preventDefault();
        if (focusedColumn < statusColumns.length - 1) {
          setFocusedColumn(focusedColumn + 1);
          setFocusedTaskIndex(0);
          announce(`Moved to ${statusColumns[focusedColumn + 1].title} column`);
        }
        break;

      case keyboardKeys.ARROW_UP:
        e.preventDefault();
        if (currentTasks.length > 0 && focusedTaskIndex > 0) {
          setFocusedTaskIndex(focusedTaskIndex - 1);
          announce(`Focused on task: ${currentTasks[focusedTaskIndex - 1].title}`);
        }
        break;

      case keyboardKeys.ARROW_DOWN:
        e.preventDefault();
        if (currentTasks.length > 0 && focusedTaskIndex < currentTasks.length - 1) {
          setFocusedTaskIndex(focusedTaskIndex + 1);
          announce(`Focused on task: ${currentTasks[focusedTaskIndex + 1].title}`);
        }
        break;

      case keyboardKeys.ENTER:
      case keyboardKeys.SPACE:
        e.preventDefault();
        if (currentTasks.length > 0) {
          const selectedTask = currentTasks[focusedTaskIndex];
          setSelectedTask(selectedTask);
          announce(`Opened task details for: ${selectedTask.title}`);
        }
        break;

      case 'n':
      case 'N':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          setShowCreateModal(true);
          announce('Opened create task modal');
        }
        break;

      case keyboardKeys.ESCAPE:
        if (selectedTask) {
          setSelectedTask(null);
          announce('Closed task details');
        } else if (showCreateModal) {
          setShowCreateModal(false);
          announce('Closed create task modal');
        }
        break;
    }
  }, [focusedColumn, focusedTaskIndex, selectedTask, showCreateModal, announce]);

  useEffect(() => {
    const boardElement = boardRef.current;
    if (boardElement) {
      boardElement.addEventListener('keydown', handleKeyDown);
      return () => boardElement.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown]);

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', `Moving task: ${task.title}`);
    announce(`Started dragging task: ${task.title}`);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();

    if (!draggedTask || draggedTask.status === newStatus) {
      setDraggedTask(null);
      return;
    }

    try {
      const updatedTask = await api.put(`/tasks/${draggedTask._id}`, { status: newStatus });
      onTaskUpdate(updatedTask);
      const column = statusColumns.find(col => col.id === newStatus);
      announce(`Dropped task "${draggedTask.title}" in ${column?.title || newStatus}`);
    } catch (error) {
      console.error('Error updating task status:', error);
      announce('Error dropping task. Please try again.');
    } finally {
      setDraggedTask(null);
    }
  };

  const TaskCard: React.FC<{ task: Task; isSelected?: boolean }> = ({ 
    task, 
    isSelected = false
  }) => (
    <div
      ref={(el) => {
        taskRefs.current[task._id] = el;
      }}
      className={`
        bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3 cursor-pointer
        transition-all duration-200 hover:shadow-md hover:border-blue-300
        ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
      `}
      draggable
      onDragStart={(e) => handleDragStart(e, task)}
      onClick={() => setSelectedTask(task)}
      onKeyDown={(e) => {
        if (e.key === keyboardKeys.ENTER || e.key === keyboardKeys.SPACE) {
          e.preventDefault();
          setSelectedTask(task);
        }
      }}
      tabIndex={isSelected ? 0 : -1}
      role="button"
      aria-label={`Task: ${task.title}. Priority: ${task.priority}. ${task.assignee?.name ? `Assigned to: ${task.assignee.name}` : 'Unassigned'}`}
      aria-describedby={`task-${task._id}-description`}
      {...ariaAttributes.button.default}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-gray-900 text-sm leading-5 flex-1">
          {task.title}
        </h4>
        <span
          className={`
            inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border
            ${getPriorityColor(task.priority)}
          `}
          aria-label={`Priority: ${task.priority}`}
        >
          {task.priority}
        </span>
      </div>

      {task.description && (
        <p 
          id={`task-${task._id}-description`}
          className="text-gray-600 text-xs mb-3 line-clamp-2"
        >
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500">
        {task.assignee ? (
          <div className="flex items-center space-x-1">
            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
              {task.assignee.name.charAt(0).toUpperCase()}
            </div>
            <span>{task.assignee.name}</span>
          </div>
        ) : (
          <span className="text-gray-400">Unassigned</span>
        )}

        {task.dueDate && (
          <time 
            dateTime={task.dueDate}
            className={`
              ${new Date(task.dueDate) < new Date() && task.status !== 'done' 
                ? 'text-red-600 font-medium' 
                : 'text-gray-500'
              }
            `}
            aria-label={`Due date: ${new Date(task.dueDate).toLocaleDateString()}`}
          >
            {new Date(task.dueDate).toLocaleDateString()}
          </time>
        )}
      </div>
    </div>
  );

  if (tasks.length === 0) {
    return (
      <div className="p-8">
        <NoTasksEmptyState 
          onCreateTask={() => setShowCreateModal(true)}
          showCreateButton={true}
        />
      </div>
    );
  }

  return (
    <div 
      className="flex-1 overflow-hidden"
      role="application"
      aria-label="Task board"
      aria-describedby="board-instructions"
    >
      {/* Screen reader only instructions */}
      <div id="board-instructions" className="sr-only">
        Use arrow keys to navigate between columns and tasks. 
        Press Enter or Space to open task details. 
        Press Ctrl+N to create a new task. 
        Press Escape to close modals.
      </div>

      {/* Live region for announcements */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
      >
        {announcementText}
      </div>

      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Project Tasks
          </h2>
          <p className="text-sm text-gray-600">
            {tasks.length} task{tasks.length !== 1 ? 's' : ''} total
          </p>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="
            inline-flex items-center px-4 py-2 bg-blue-600 text-white 
            rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 
            focus:ring-blue-500 focus:ring-offset-2 transition-colors
          "
          aria-label={ariaLabels.task.create}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Task
        </button>
      </div>

      <div 
        ref={boardRef}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-full"
        tabIndex={0}
        aria-label="Task board grid"
        role="grid"
      >
        {statusColumns.map((column, columnIndex) => {
          const columnTasks = getTasksByStatus(column.id);
          const isCurrentColumn = columnIndex === focusedColumn;
          
          return (
            <div
              key={column.id}
              ref={(el) => {
                columnRefs.current[columnIndex] = el;
              }}
              className={`
                flex flex-col bg-gray-50 rounded-lg p-4 min-h-96
                ${isCurrentColumn ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
              `}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
              role="gridcell"
              aria-label={`${column.title} column containing ${columnTasks.length} tasks`}
              aria-describedby={`column-${column.id}-description`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-medium text-gray-900 text-sm">
                    {column.title}
                  </h3>
                  <p 
                    id={`column-${column.id}-description`}
                    className="text-xs text-gray-500"
                  >
                    {column.description} ({columnTasks.length})
                  </p>
                </div>
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: column.color }}
                  aria-hidden="true"
                />
              </div>

              <div className="flex-1 space-y-3" role="list" aria-label={`${column.title} tasks`}>
                {columnTasks.length === 0 ? (
                  <div 
                    className="
                      flex items-center justify-center h-32 border-2 border-dashed 
                      border-gray-300 rounded-lg text-gray-400 text-sm
                    "
                    role="listitem"
                  >
                    No tasks in {column.title.toLowerCase()}
                  </div>
                ) : (
                  columnTasks.map((task, taskIndex) => (
                    <div key={task._id} role="listitem">
                      <TaskCard
                        task={task}
                        isSelected={isCurrentColumn && taskIndex === focusedTaskIndex}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateTaskModalEnhanced
          project={project}
          onClose={() => setShowCreateModal(false)}
          onTaskCreated={(task) => {
            onTaskCreate(task);
            setShowCreateModal(false);
            announce(`Created new task: ${task.title}`);
          }}
        />
      )}

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          project={project}
          onClose={() => setSelectedTask(null)}
          onTaskUpdate={(updatedTask: Task) => {
            onTaskUpdate(updatedTask);
            setSelectedTask(updatedTask);
            announce(`Updated task: ${updatedTask.title}`);
          }}
          onTaskDelete={(taskId: string) => {
            onTaskDelete(taskId);
            setSelectedTask(null);
            announce('Task deleted');
          }}
        />
      )}
    </div>
  );
};

export default TaskBoardAccessible;
