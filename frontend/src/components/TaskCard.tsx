import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import './TaskCard.css';

interface Task {
  taskId: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate?: string;
  createdBy: string;
  createdAt: number;
  assignedTo: string[];
}

interface TaskCardProps {
  task: Task;
  onUpdate: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onUpdate }) => {
  const { isAdmin } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState(task.status);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignEmail, setAssignEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const statusOptions = ['open', 'in_progress', 'completed', 'closed'];
  const priorityColors = {
    low: '#4caf50',
    medium: '#ff9800',
    high: '#f44336',
  };

  const handleStatusUpdate = async () => {
    if (status === task.status) {
      setIsEditing(false);
      return;
    }

    setLoading(true);
    try {
      await apiService.updateTask(task.taskId, { status });
      onUpdate();
      setIsEditing(false);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!assignEmail.trim()) {
      alert('Please enter an email address');
      return;
    }

    setLoading(true);
    try {
      await apiService.assignTask(task.taskId, assignEmail);
      setAssignEmail('');
      setIsAssigning(false);
      onUpdate();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to assign task');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="task-card">
      <div className="task-header">
        <h3 className="task-title">{task.title}</h3>
        <span
          className={`task-priority ${task.priority}`}
        >
          {task.priority}
        </span>
      </div>

      <p className="task-description">{task.description || 'No description'}</p>

      <div className="task-details">
        <div className="task-detail-item">
          <strong>Status:</strong>
          {isEditing ? (
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="status-select"
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option.replace('_', ' ')}
                </option>
              ))}
            </select>
          ) : (
            <span className={`task-status status-${task.status}`}>
              {task.status.replace('_', ' ')}
            </span>
          )}
        </div>

        <div className="task-detail-item">
          <strong>Created by:</strong> {task.createdBy}
        </div>

        {task.dueDate && (
          <div className="task-detail-item">
            <strong>Due Date:</strong> {task.dueDate}
          </div>
        )}

        <div className="task-detail-item">
          <strong>Created:</strong> {formatDate(task.createdAt)}
        </div>

        {task.assignedTo && task.assignedTo.length > 0 && (
          <div className="task-detail-item">
            <strong>Assigned to:</strong>
            <div className="assigned-list">
              {task.assignedTo.map((email, index) => (
                <span key={index} className="assigned-badge">
                  {email}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="task-actions">
        {isEditing ? (
          <>
            <button
              className="btn btn-primary"
              onClick={handleStatusUpdate}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setStatus(task.status);
                setIsEditing(false);
              }}
              disabled={loading}
            >
              Cancel
            </button>
          </>
        ) : (
          <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
            Update Status
          </button>
        )}

        {isAdmin && (
          <>
            {isAssigning ? (
              <div className="assign-form">
                <input
                  type="email"
                  placeholder="Enter user email"
                  value={assignEmail}
                  onChange={(e) => setAssignEmail(e.target.value)}
                  className="assign-input"
                />
                <button
                  className="btn btn-primary"
                  onClick={handleAssign}
                  disabled={loading}
                >
                  {loading ? 'Assigning...' : 'Assign'}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setAssignEmail('');
                    setIsAssigning(false);
                  }}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                className="btn btn-secondary"
                onClick={() => setIsAssigning(true)}
              >
                Assign User
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
