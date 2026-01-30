import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import TaskCard from '../components/TaskCard';
import CreateTaskModal from '../components/CreateTaskModal';
import apiService from '../services/api';
import './Dashboard.css';

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

const Dashboard: React.FC = () => {
  const { isAdmin } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  const loadTasks = async () => {
    setLoading(true);
    try {
      const response = await apiService.getTasks();
      setTasks(response.tasks || []);
    } catch (error: any) {
      console.error('Error loading tasks:', error);
      alert(error.response?.data?.error || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const filteredTasks = tasks.filter((task) => {
    if (filterStatus === 'all') return true;
    return task.status === filterStatus;
  });

  const statusCounts = {
    all: tasks.length,
    open: tasks.filter((t) => t.status === 'open').length,
    in_progress: tasks.filter((t) => t.status === 'in_progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    closed: tasks.filter((t) => t.status === 'closed').length,
  };

  return (
    <div className="dashboard">
      <Navbar />

      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Task Dashboard</h1>
          {isAdmin && (
            <button
              className="btn btn-primary"
              onClick={() => setShowCreateModal(true)}
            >
              + Create Task
            </button>
          )}
        </div>

        <div className="dashboard-stats">
          <div className="stat-card" onClick={() => setFilterStatus('all')}>
            <h3>{statusCounts.all}</h3>
            <p>Total Tasks</p>
          </div>
          <div className="stat-card" onClick={() => setFilterStatus('open')}>
            <h3>{statusCounts.open}</h3>
            <p>Open</p>
          </div>
          <div
            className="stat-card"
            onClick={() => setFilterStatus('in_progress')}
          >
            <h3>{statusCounts.in_progress}</h3>
            <p>In Progress</p>
          </div>
          <div
            className="stat-card"
            onClick={() => setFilterStatus('completed')}
          >
            <h3>{statusCounts.completed}</h3>
            <p>Completed</p>
          </div>
        </div>

        <div className="dashboard-filters">
          <label>Filter by Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Tasks</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div className="tasks-container">
          {loading ? (
            <div className="loading">Loading tasks...</div>
          ) : filteredTasks.length === 0 ? (
            <div className="no-tasks">
              <p>No tasks found</p>
              {isAdmin && (
                <button
                  className="btn btn-primary"
                  onClick={() => setShowCreateModal(true)}
                >
                  Create Your First Task
                </button>
              )}
            </div>
          ) : (
            filteredTasks.map((task) => (
              <TaskCard key={task.taskId} task={task} onUpdate={loadTasks} />
            ))
          )}
        </div>
      </div>

      {showCreateModal && (
        <CreateTaskModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={loadTasks}
        />
      )}
    </div>
  );
};

export default Dashboard;
