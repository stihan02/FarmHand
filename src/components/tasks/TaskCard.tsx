import React from 'react';
import { Task } from '../../types';
import { formatDate, isOverdue } from '../../utils/helpers';
import { Clock, CheckCircle, Calendar, Trash2, Bell } from 'lucide-react';
import { useToast } from '../ToastContext';

interface TaskCardProps {
  task: Task;
  onToggleStatus: (task: Task) => void;
  onRemove: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onToggleStatus, onRemove }) => {
  const isCompleted = task.status === 'Completed';
  const overdue = !isCompleted && isOverdue(task.dueDate);
  const { showToast } = useToast();

  const handleComplete = () => {
    try {
      onComplete(task.id);
      showToast({ type: 'success', message: 'Task completed.' });
    } catch (err) {
      showToast({ type: 'error', message: 'Failed to complete task.' });
    }
  };

  const handleDelete = () => {
    if (!window.confirm('Delete this task?')) return;
    try {
      onDelete(task.id);
      showToast({ type: 'success', message: 'Task deleted.' });
    } catch (err) {
      showToast({ type: 'error', message: 'Failed to delete task.' });
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border-2 p-4 hover:shadow-md transition-all duration-200 ${
      isCompleted ? 'border-emerald-200 bg-emerald-50' : 
      overdue ? 'border-red-200 bg-red-50' : 'border-gray-200'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3">
          <button
            onClick={() => onToggleStatus(task)}
            className={`mt-1 transition-colors ${
              isCompleted ? 'text-emerald-600' : 'text-gray-400 hover:text-emerald-600'
            }`}
          >
            <CheckCircle className={`h-5 w-5 ${isCompleted ? 'fill-current' : ''}`} />
          </button>
          <div className="flex-1">
            <h3 className={`font-medium ${
              isCompleted ? 'text-gray-600 line-through' : 'text-gray-900'
            } flex items-center gap-2`}>
              {task.description}
              {task.reminder && (
                <span title={overdue ? 'Reminder overdue' : 'Reminder'}>
                  <Bell className={`inline h-4 w-4 ml-1 ${overdue ? 'text-red-500' : 'text-yellow-500'}`} />
                </span>
              )}
            </h3>
            <div className="flex items-center space-x-4 mt-2">
              <div className={`flex items-center space-x-1 text-sm ${
                overdue ? 'text-red-600' : isCompleted ? 'text-emerald-600' : 'text-gray-600'
              }`}>
                <Calendar className="h-4 w-4" />
                <span>{formatDate(task.dueDate)}</span>
              </div>
              {overdue && (
                <div className="flex items-center space-x-1 text-red-600 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>Overdue</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => onRemove(task)}
          className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-red-500 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="flex justify-between items-center">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          isCompleted ? 'bg-emerald-100 text-emerald-800' :
          overdue ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {isCompleted ? 'Completed' : overdue ? 'Overdue' : 'Pending'}
        </span>
      </div>
    </div>
  );
};