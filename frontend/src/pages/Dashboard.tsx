import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
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
  const { user, isAdmin, signOut } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    avatar: '',
    phone: '',
    department: '',
    bio: '',
    location: ''
  });

  const loadTasks = async () => {
    setLoading(true);
    try {
      const response = await apiService.getTasks();
      setTasks(response.tasks || []);
    } catch (error: any) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    const email = user?.signInDetails?.loginId || '';
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setProfileData(JSON.parse(savedProfile));
    } else {
      // Fetch user attributes from Cognito
      try {
        const { fetchUserAttributes } = await import('aws-amplify/auth');
        const attributes = await fetchUserAttributes();
        const userName = attributes.name || email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
        setProfileData({
          name: userName,
          email: email,
          avatar: '',
          phone: '',
          department: '',
          bio: '',
          location: ''
        });
      } catch (error) {
        console.error('Error fetching user attributes:', error);
        setProfileData({
          name: getUserName(),
          email: email,
          avatar: '',
          phone: '',
          department: '',
          bio: '',
          location: ''
        });
      }
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesSearch = searchQuery === '' || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statusCounts = {
    all: tasks.length,
    open: tasks.filter((t) => t.status === 'open').length,
    in_progress: tasks.filter((t) => t.status === 'in_progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
  };

  const highPriorityTasks = filteredTasks.filter(t => t.priority === 'high' && t.status !== 'completed');
  const activeTasks = filteredTasks.filter(t => t.status === 'in_progress' || t.status === 'open');
  const completedTasks = filteredTasks.filter(t => t.status === 'completed');

  const getUserInitials = () => {
    const email = user?.signInDetails?.loginId || '';
    const name = email.split('@')[0];
    return name.substring(0, 2).toUpperCase();
  };

  const getUserName = () => {
    const email = user?.signInDetails?.loginId || '';
    return email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'No due date';
    return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    try {
      await apiService.updateTask(taskId, { status: newStatus });
      await loadTasks();
      setSelectedTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task status');
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({ ...profileData, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    localStorage.setItem('userProfile', JSON.stringify(profileData));
    alert('Profile updated successfully!');
    setShowProfileModal(false);
  };

  return (
    <div className="dashboard-modern">
      {/* Header */}
      <header className="header-modern">
        <div className="header-content-modern">
          <div className="logo-modern">
            <div className="logo-icon-modern">☰</div>
            <span>Task Management</span>
          </div>
          <div className="header-actions-modern">
            <div className="user-profile-modern" onClick={() => setShowProfileModal(true)}>
              {profileData.avatar ? (
                <img src={profileData.avatar} alt="Profile" className="user-avatar-modern" style={{ objectFit: 'cover' }} />
              ) : (
                <div className="user-avatar-modern">{profileData.name ? profileData.name.substring(0, 2).toUpperCase() : getUserInitials()}</div>
              )}
              <div className="user-name-modern">{profileData.name || getUserName()}</div>
            </div>
            {isAdmin && (
              <button
                className="btn-sign-out-modern"
                onClick={() => window.location.href = '/admin'}
                style={{ marginRight: '0.5rem' }}
              >
                Admin View
              </button>
            )}
            <button className="btn-sign-out-modern" onClick={signOut}>Sign Out</button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="container-modern">
        {/* Welcome Section */}
        <div className="welcome-section-modern">
          <h1 className="welcome-title-modern">Welcome back, {getUserName()}! 👋</h1>
          <p className="welcome-subtitle-modern">Here's what's happening with your tasks today</p>
        </div>

        {/* Stats Overview */}
        <div className="stats-overview-modern">
          <div className="stat-box-modern" style={{ borderLeft: '3px solid var(--primary)' }}>
            <div className="stat-label-modern">Total Tasks</div>
            <div className="stat-value-modern" style={{ color: 'var(--primary)' }}>{statusCounts.all}</div>
          </div>
          <div className="stat-box-modern" style={{ borderLeft: '3px solid var(--warning)' }}>
            <div className="stat-label-modern">In Progress</div>
            <div className="stat-value-modern" style={{ color: 'var(--warning)' }}>{statusCounts.in_progress}</div>
          </div>
          <div className="stat-box-modern" style={{ borderLeft: '3px solid var(--success)' }}>
            <div className="stat-label-modern">Completed</div>
            <div className="stat-value-modern" style={{ color: 'var(--success)' }}>{statusCounts.completed}</div>
          </div>
          <div className="stat-box-modern" style={{ borderLeft: '3px solid var(--info)' }}>
            <div className="stat-label-modern">Open</div>
            <div className="stat-value-modern" style={{ color: 'var(--info)' }}>{statusCounts.open}</div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="action-bar-modern">
          <div className="search-box-modern">
            <span className="search-icon-modern">🔍</span>
            <input
              type="text"
              className="search-input-modern"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-group-modern">
            <button
              className={`filter-btn-modern ${filterStatus === 'all' ? 'active' : ''}`}
              onClick={() => setFilterStatus('all')}
            >
              All Tasks
            </button>
            <button
              className={`filter-btn-modern ${filterStatus === 'open' ? 'active' : ''}`}
              onClick={() => setFilterStatus('open')}
            >
              Open
            </button>
            <button
              className={`filter-btn-modern ${filterStatus === 'in_progress' ? 'active' : ''}`}
              onClick={() => setFilterStatus('in_progress')}
            >
              In Progress
            </button>
            <button
              className={`filter-btn-modern ${filterStatus === 'completed' ? 'active' : ''}`}
              onClick={() => setFilterStatus('completed')}
            >
              Completed
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-modern">Loading tasks...</div>
        ) : (
          <>
            {/* High Priority Tasks */}
            {highPriorityTasks.length > 0 && (
              <div className="tasks-section-modern">
                <h2 className="section-title-modern">🔥 High Priority Tasks</h2>
                <div className="tasks-grid-modern">
                  {highPriorityTasks.map((task) => (
                    <div key={task.taskId} className="task-card-modern" onClick={() => handleTaskClick(task)} style={{ cursor: 'pointer' }}>
                      <div className="task-header-modern">
                        <div style={{ flex: 1 }}>
                          <h3 className="task-title-modern">{task.title}</h3>
                          <p className="task-description-modern">{task.description}</p>
                        </div>
                        <div className="task-actions-modern">
                          <button
                            className="task-action-btn-modern complete"
                            title="Mark as complete"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(task.taskId, 'completed');
                            }}
                          >
                            ✓
                          </button>
                        </div>
                      </div>
                      <div className="task-meta-modern">
                        <span className={`priority-badge-modern priority-${task.priority}`}>
                          {task.priority}
                        </span>
                        <span className={`status-badge-modern status-${task.status.replace('_', '-')}`}>
                          {task.status.replace('_', ' ')}
                        </span>
                        <div className="task-meta-item-modern">
                          <span>📅</span>
                          <span><strong>Due:</strong> {formatDate(task.dueDate ? parseInt(task.dueDate) : undefined)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Active Tasks */}
            {activeTasks.length > 0 && (
              <div className="tasks-section-modern">
                <h2 className="section-title-modern">📋 Active Tasks</h2>
                <div className="tasks-grid-modern">
                  {activeTasks.map((task) => (
                    <div key={task.taskId} className="task-card-modern" onClick={() => handleTaskClick(task)} style={{ cursor: 'pointer' }}>
                      <div className="task-header-modern">
                        <div style={{ flex: 1 }}>
                          <h3 className="task-title-modern">{task.title}</h3>
                          <p className="task-description-modern">{task.description}</p>
                        </div>
                        <div className="task-actions-modern">
                          <button
                            className="task-action-btn-modern complete"
                            title="Mark as complete"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(task.taskId, 'completed');
                            }}
                          >
                            ✓
                          </button>
                        </div>
                      </div>
                      <div className="task-meta-modern">
                        <span className={`priority-badge-modern priority-${task.priority}`}>
                          {task.priority}
                        </span>
                        <span className={`status-badge-modern status-${task.status.replace('_', '-')}`}>
                          {task.status.replace('_', ' ')}
                        </span>
                        <div className="task-meta-item-modern">
                          <span>📅</span>
                          <span><strong>Due:</strong> {formatDate(task.dueDate ? parseInt(task.dueDate) : undefined)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recently Completed */}
            {completedTasks.length > 0 && (
              <div className="tasks-section-modern">
                <h2 className="section-title-modern">✅ Recently Completed</h2>
                <div className="tasks-grid-modern">
                  {completedTasks.slice(0, 3).map((task) => (
                    <div key={task.taskId} className="task-card-modern" onClick={() => handleTaskClick(task)} style={{ opacity: 0.7, cursor: 'pointer' }}>
                      <div className="task-header-modern">
                        <div style={{ flex: 1 }}>
                          <h3 className="task-title-modern">{task.title}</h3>
                          <p className="task-description-modern">{task.description}</p>
                        </div>
                      </div>
                      <div className="task-meta-modern">
                        <span className={`priority-badge-modern priority-${task.priority}`}>
                          {task.priority}
                        </span>
                        <span className="status-badge-modern status-completed">Completed</span>
                        <div className="task-meta-item-modern">
                          <span>✓</span>
                          <span><strong>Completed:</strong> {formatDate(task.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filteredTasks.length === 0 && (
              <div className="empty-state-modern">
                <div className="empty-icon-modern">📋</div>
                <h3 className="empty-title-modern">No tasks found</h3>
                <p className="empty-text-modern">Try adjusting your filters or search query</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Task Details Modal */}
      {selectedTask && (
        <div className="modal-overlay-modern" onClick={() => setSelectedTask(null)}>
          <div className="modal-content-modern" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header-modern">
              <h2>{selectedTask.title}</h2>
              <button className="modal-close-modern" onClick={() => setSelectedTask(null)}>×</button>
            </div>
            <div className="modal-body-modern">
              <div className="form-group-modern">
                <label>Description</label>
                <p style={{ padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: '8px', minHeight: '60px' }}>
                  {selectedTask.description || 'No description provided'}
                </p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group-modern">
                  <label>Status</label>
                  <select
                    value={selectedTask.status}
                    onChange={(e) => setSelectedTask({ ...selectedTask, status: e.target.value })}
                    className="input-modern"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div className="form-group-modern">
                  <label>Priority</label>
                  <span className={`priority-badge-modern priority-${selectedTask.priority}`} style={{ display: 'inline-block', marginTop: '0.5rem' }}>
                    {selectedTask.priority}
                  </span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group-modern">
                  <label>Created By</label>
                  <p style={{ padding: '0.5rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                    {selectedTask.createdBy}
                  </p>
                </div>
                <div className="form-group-modern">
                  <label>Due Date</label>
                  <p style={{ padding: '0.5rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                    {formatDate(selectedTask.dueDate ? parseInt(selectedTask.dueDate) : undefined)}
                  </p>
                </div>
              </div>
              {selectedTask.assignedTo && selectedTask.assignedTo.length > 0 && (
                <div className="form-group-modern">
                  <label>Assigned To</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {selectedTask.assignedTo.map((email, index) => (
                      <span key={index} style={{ padding: '0.25rem 0.75rem', background: 'var(--primary)', color: 'white', borderRadius: '12px', fontSize: '0.875rem' }}>
                        {email}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer-modern">
              <button className="btn-secondary-modern" onClick={() => setSelectedTask(null)}>Close</button>
              <button 
                className="btn-primary-modern" 
                onClick={() => handleUpdateStatus(selectedTask.taskId, selectedTask.status)}
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="modal-overlay-modern" onClick={() => setShowProfileModal(false)}>
          <div className="modal-content-modern" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-modern">
              <h2>Profile Settings</h2>
              <button className="modal-close-modern" onClick={() => setShowProfileModal(false)}>×</button>
            </div>
            <div className="modal-body-modern">
              <div className="profile-avatar-section">
                {profileData.avatar ? (
                  <img src={profileData.avatar} alt="Profile" className="profile-avatar-large" style={{ objectFit: 'cover' }} />
                ) : (
                  <div className="profile-avatar-large">{profileData.name ? profileData.name.substring(0, 2).toUpperCase() : getUserInitials()}</div>
                )}
                <label htmlFor="avatar-upload" className="btn-upload-avatar">
                  {profileData.avatar ? 'Change Photo' : 'Upload Photo'}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="avatar-upload"
                  onChange={handleAvatarUpload}
                />
              </div>
              <div className="profile-form">
                <div className="form-group-modern">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="input-modern"
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="form-group-modern">
                  <label>Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    className="input-modern"
                    disabled
                    style={{ opacity: 0.6, cursor: 'not-allowed' }}
                  />
                  <small style={{ color: 'var(--gray)', fontSize: '0.875rem' }}>Email cannot be changed</small>
                </div>
                <div className="form-group-modern">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="input-modern"
                    placeholder="+233 XX XXX XXXX"
                  />
                </div>
                <div className="form-group-modern">
                  <label>Department</label>
                  <input
                    type="text"
                    value={profileData.department}
                    onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                    className="input-modern"
                    placeholder="e.g., Engineering, Marketing"
                  />
                </div>
                <div className="form-group-modern">
                  <label>Location</label>
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                    className="input-modern"
                    placeholder="e.g., Accra, Ghana"
                  />
                </div>
                <div className="form-group-modern">
                  <label>Bio</label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    className="input-modern"
                    placeholder="Tell us about yourself..."
                    rows={4}
                    style={{ resize: 'vertical', minHeight: '100px' }}
                  />
                </div>
                <div className="form-group-modern">
                  <label>Role</label>
                  <input
                    type="text"
                    value={isAdmin ? 'Admin' : 'Member'}
                    className="input-modern"
                    disabled
                    style={{ opacity: 0.6, cursor: 'not-allowed' }}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer-modern">
              <button className="btn-secondary-modern" onClick={() => setShowProfileModal(false)}>Cancel</button>
              <button className="btn-primary-modern" onClick={handleSaveProfile}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
