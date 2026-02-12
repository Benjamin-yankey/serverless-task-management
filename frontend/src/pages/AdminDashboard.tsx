import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import CreateTaskModal from '../components/CreateTaskModal';
import './AdminDashboard.css';

interface CognitoUser {
  username: string;
  email: string;
  name: string;
  status: string;
  enabled: boolean;
  groups: string[];
  createdAt: string;
}

interface Task {
  taskId: string;
  title: string;
  status: string;
  assignedTo?: string;
  createdAt?: string;
}

interface Activity {
  id: string;
  icon: string;
  text: string;
  time: string;
  bg: string;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut: authSignOut } = useAuth();
  const [users, setUsers] = useState<CognitoUser[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<Activity[]>([
    { id: '1', icon: '✓', text: 'System initialized', time: 'just now', bg: '#10b981' }
  ]);
  const [activeSessions, setActiveSessions] = useState(156);
  const [avgResponseTime, setAvgResponseTime] = useState(2.4);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState('');
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'User', status: 'Active' });
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [emailData, setEmailData] = useState({ subject: '', message: '' });
  const [chartPeriod, setChartPeriod] = useState(7);
  const [profileData, setProfileData] = useState({
    name: 'Benjamin Yankey',
    email: 'benjamin.yankey@amalitech.com',
    phone: '+233 24 123 4567',
    department: 'Engineering',
    role: 'System Administrator',
    bio: 'Experienced system administrator with 5+ years in cloud infrastructure.',
    avatar: '',
    notifications: true,
    emailAlerts: true,
    darkMode: false
  });
  const [settings, setSettings] = useState({
    emailNotifications: true,
    autoAssignment: false,
    twoFactor: true,
    dataBackup: true,
    performanceMonitoring: true
  });
  const [systemConfig, setSystemConfig] = useState({
    systemName: 'TaskFlow AMALITECH',
    sessionTimeout: 30,
    defaultRole: 'User'
  });

  useEffect(() => {
    loadData();
    loadUserProfile();
    const sessionInterval = setInterval(() => {
      setActiveSessions(prev => prev + Math.floor(Math.random() * 5) - 2);
    }, 5000);
    const responseInterval = setInterval(() => {
      setAvgResponseTime(prev => parseFloat((2.4 + (Math.random() * 0.6 - 0.3)).toFixed(1)));
    }, 8000);
    return () => {
      clearInterval(sessionInterval);
      clearInterval(responseInterval);
    };
  }, []);

  const loadUserProfile = async () => {
    try {
      const { fetchUserAttributes } = await import('aws-amplify/auth');
      const attributes = await fetchUserAttributes();
      const email = attributes.email || user?.signInDetails?.loginId || '';
      const userName = attributes.name || email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
      setProfileData(prev => ({
        ...prev,
        name: userName,
        email: email
      }));
    } catch (error) {
      console.error('Error fetching user attributes:', error);
    }
  };

  const loadData = async () => {
    try {
      const [tasksData, usersData] = await Promise.all([
        api.getTasks(),
        api.getUsers()
      ]);
      setTasks(Array.isArray(tasksData) ? tasksData : tasksData.tasks || []);
      setUsers(usersData.users || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setTasks([]);
      setUsers([]);
      setLoading(false);
    }
  };

  const addActivity = (icon: string, text: string, bg: string) => {
    const newActivity = { id: Date.now().toString(), icon, text, time: 'just now', bg };
    setActivities(prev => [newActivity, ...prev].slice(0, 20));
  };

  const getActiveTasksCount = () => {
    if (!Array.isArray(tasks)) return 0;
    return tasks.filter(t => t.status === 'In Progress' || t.status === 'Pending').length;
  };
  
  const getCompletionRate = () => {
    if (!Array.isArray(tasks) || tasks.length === 0) return '0.0';
    const completed = tasks.filter(t => t.status === 'Completed').length;
    return ((completed / tasks.length) * 100).toFixed(1);
  };

  const handleAddUser = () => {
    setFormData({ name: '', email: '', role: 'User', status: 'Active' });
    setShowModal('user');
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email.endsWith('@amalitech.com')) {
      alert('Email must be @amalitech.com domain');
      return;
    }
    addActivity('👤', `New user ${formData.name} registered`, '#8b5cf6');
    setShowModal('');
    loadData();
  };

  const handleDeleteUser = (username: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      addActivity('🗑️', `Admin deleted user ${username}`, '#ef4444');
      loadData();
    }
  };

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUsers.length === 0) {
      alert('Please select at least one recipient');
      return;
    }
    console.log('Broadcast:', { subject: emailData.subject, message: emailData.message, recipients: selectedUsers });
    addActivity('📧', `Broadcast sent to ${selectedUsers.length} users`, '#3b82f6');
    setShowModal('');
    setSelectedUsers([]);
    setEmailData({ subject: '', message: '' });
  };

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    addActivity('⚙️', `${key.replace(/([A-Z])/g, ' $1').trim()} ${!settings[key] ? 'enabled' : 'disabled'}`, '#64748b');
  };

  const saveConfig = () => {
    addActivity('⚙️', 'System settings updated', '#64748b');
    setShowModal('');
  };

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    addActivity('👤', `Profile updated for ${profileData.name}`, '#3b82f6');
    setShowModal('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({ ...profileData, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return <div className="admin-dashboard"><div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div></div>;
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="header-left">
          <h1>Admin Dashboard</h1>
          <p>TaskFlow AMALITECH Management System</p>
        </div>
        <div className="header-right">
          <button className="sign-out-btn" onClick={() => navigate('/dashboard')} style={{ marginRight: '0.5rem', background: 'var(--secondary)' }}>User View</button>
          <div className="user-info" style={{ cursor: 'pointer' }} onClick={() => setShowModal('profile')}>
            <div className="user-avatar" style={profileData.avatar ? { backgroundImage: `url(${profileData.avatar})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
              {!profileData.avatar && profileData.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="user-details">
              <div className="user-name">{profileData.name}</div>
              <div className="user-email">{profileData.email}</div>
            </div>
          </div>
          <button className="sign-out-btn" onClick={() => authSignOut()}>Sign Out</button>
        </div>
      </header>

      <main className="admin-main">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>👥</div>
            <div className="stat-content">
              <div className="stat-label">Total Users</div>
              <div className="stat-value">{users.length}</div>
              <div className="stat-change positive">↑ 12% vs last month</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.1)' }}>📋</div>
            <div className="stat-content">
              <div className="stat-label">Active Tasks</div>
              <div className="stat-value">{getActiveTasksCount()}</div>
              <div className="stat-change positive">↑ 8% vs last month</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>✓</div>
            <div className="stat-content">
              <div className="stat-label">Completion Rate</div>
              <div className="stat-value">{getCompletionRate()}%</div>
              <div className="stat-change positive">↑ 5% vs last month</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>🔗</div>
            <div className="stat-content">
              <div className="stat-label">Active Sessions</div>
              <div className="stat-value">{activeSessions}</div>
              <div className="stat-change negative">↓ 2% vs last week</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(6, 182, 212, 0.1)' }}>⚡</div>
            <div className="stat-content">
              <div className="stat-label">Avg Response Time</div>
              <div className="stat-value">{avgResponseTime}s</div>
              <div className="stat-change positive">↑ 15% faster</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(236, 72, 153, 0.1)' }}>🚀</div>
            <div className="stat-content">
              <div className="stat-label">System Uptime</div>
              <div className="stat-value">98.9%</div>
              <div className="stat-change positive">↑ 0.3% vs last month</div>
            </div>
          </div>
        </div>

        <div className="quick-actions">
          <button className="action-card" onClick={() => setShowCreateTask(true)}>
            <div className="action-icon" style={{ background: 'var(--success)' }}>+</div>
            <div className="action-content">
              <div className="action-title">Create Task</div>
              <div className="action-description">Add new task</div>
            </div>
          </button>
          <button className="action-card" onClick={handleAddUser}>
            <div className="action-icon" style={{ background: 'var(--primary)' }}>+</div>
            <div className="action-content">
              <div className="action-title">Add New User</div>
              <div className="action-description">Create user account</div>
            </div>
          </button>
          <button className="action-card" onClick={() => setShowModal('reports')}>
            <div className="action-icon" style={{ background: 'var(--secondary)' }}>📊</div>
            <div className="action-content">
              <div className="action-title">View Reports</div>
              <div className="action-description">Analytics dashboard</div>
            </div>
          </button>
          <button className="action-card" onClick={() => setShowModal('config')}>
            <div className="action-icon" style={{ background: 'var(--success)' }}>⚙️</div>
            <div className="action-content">
              <div className="action-title">System Config</div>
              <div className="action-description">Manage settings</div>
            </div>
          </button>
          <button className="action-card" onClick={() => setShowModal('broadcast')}>
            <div className="action-icon" style={{ background: 'var(--warning)' }}>📧</div>
            <div className="action-content">
              <div className="action-title">Send Broadcast</div>
              <div className="action-description">Email all users</div>
            </div>
          </button>
        </div>

        <div className="main-grid">
          <div className="user-management">
            <div className="card-header">
              <h2>User Management</h2>
              <button className="add-user-btn" onClick={handleAddUser}>Add User</button>
            </div>
            <div className="table-container">
              <table className="user-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Tasks</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? users.map((user, idx) => (
                    <tr key={user.username}>
                      <td>
                        <div className="user-cell">
                          <div className="avatar avatar-primary">{user.name.substring(0, 2).toUpperCase()}</div>
                          <span>{user.name}</span>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td><span className={`badge ${user.groups.includes('Admins') ? 'badge-primary' : 'badge-secondary'}`}>{user.groups.includes('Admins') ? 'Admin' : 'User'}</span></td>
                      <td>{Math.floor(Math.random() * 50)}</td>
                      <td><span className={`badge ${user.status === 'CONFIRMED' ? 'badge-success' : 'badge-warning'}`}>{user.status === 'CONFIRMED' ? 'Active' : user.status}</span></td>
                      <td>
                        <div className="action-buttons">
                          <button className="icon-btn">✏️</button>
                          <button className="icon-btn" onClick={() => handleDeleteUser(user.username)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray)' }}>
                        No users found. Add users to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="activity-feed">
            <div className="card-header">
              <h2>Recent Activity</h2>
            </div>
            <div className="activity-list">
              {activities.map(activity => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon" style={{ background: `${activity.bg}20`, color: activity.bg }}>{activity.icon}</div>
                  <div className="activity-content">
                    <div className="activity-text">{activity.text}</div>
                    <div className="activity-time">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="performance-section">
          <div className="card-header">
            <h2>Task Completion Trends</h2>
            <select className="period-select" value={chartPeriod} onChange={(e) => setChartPeriod(Number(e.target.value))}>
              <option value={7}>Last 7 Days</option>
              <option value={30}>Last 30 Days</option>
              <option value={90}>Last 90 Days</option>
              <option value={365}>Last Year</option>
            </select>
          </div>
          <div className="chart-placeholder">
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '200px', padding: '20px' }}>
              {[45, 52, 48, 61, 58, 65, 70].map((val, idx) => (
                <div key={idx} style={{ flex: 1, background: 'linear-gradient(to top, #3b82f6, #8b5cf6)', borderRadius: '6px 6px 0 0', height: `${(val / 70) * 100}%` }}></div>
              ))}
            </div>
          </div>
        </div>

        <div className="settings-section">
          <div className="card-header">
            <h2>System Settings</h2>
          </div>
          <div className="settings-list">
            {Object.entries(settings).map(([key, value], idx) => (
              <div key={key} className="setting-item" style={{ background: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
                <div className="setting-content">
                  <div className="setting-title">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                  <div className="setting-description">Toggle {key}</div>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" checked={value} onChange={() => toggleSetting(key as keyof typeof settings)} />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer style={{
        background: 'white',
        borderTop: '1px solid var(--gray-light)',
        padding: '2rem',
        marginTop: '3rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
          <p style={{ color: 'var(--gray)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            © 2024 TaskFlow AMALITECH. All rights reserved.
          </p>
          <p style={{ color: 'var(--gray)', fontSize: '0.75rem' }}>
            Built with React, AWS Lambda, DynamoDB & Cognito
          </p>
        </div>
      </footer>

      {showModal === 'user' && (
        <div className="modal" onClick={() => setShowModal('')}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New User</h2>
              <button onClick={() => setShowModal('')}>&times;</button>
            </div>
            <form onSubmit={handleSaveUser}>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <button type="submit" className="btn-primary">Save User</button>
            </form>
          </div>
        </div>
      )}

      {showModal === 'broadcast' && (
        <div className="modal" onClick={() => setShowModal('')}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Send Broadcast Email</h2>
              <button onClick={() => setShowModal('')}>&times;</button>
            </div>
            <form onSubmit={handleBroadcast}>
              <div className="form-group">
                <label>Subject</label>
                <input type="text" value={emailData.subject} onChange={(e) => setEmailData({...emailData, subject: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea value={emailData.message} onChange={(e) => setEmailData({...emailData, message: e.target.value})} required />
              </div>
              <button type="submit" className="btn-primary">Send Email</button>
            </form>
          </div>
        </div>
      )}

      {showModal === 'reports' && (
        <div className="modal" onClick={() => setShowModal('')}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Reports Dashboard</h2>
              <button onClick={() => setShowModal('')}>&times;</button>
            </div>
            <div style={{ padding: '20px' }}>
              <h3>User Role Distribution</h3>
              <p>Admin: 1 | Users: {users.length}</p>
              <button className="btn-primary" onClick={() => alert('Report exported!')}>Export Report</button>
            </div>
          </div>
        </div>
      )}

      {showModal === 'config' && (
        <div className="modal" onClick={() => setShowModal('')}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>System Configuration</h2>
              <button onClick={() => setShowModal('')}>&times;</button>
            </div>
            <div className="form-group">
              <label>System Name</label>
              <input type="text" value={systemConfig.systemName} onChange={(e) => setSystemConfig({...systemConfig, systemName: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Session Timeout</label>
              <select value={systemConfig.sessionTimeout} onChange={(e) => setSystemConfig({...systemConfig, sessionTimeout: Number(e.target.value)})}>
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>60 minutes</option>
              </select>
            </div>
            <button className="btn-primary" onClick={saveConfig}>Save Configuration</button>
          </div>
        </div>
      )}

      {showModal === 'profile' && (
        <div className="modal" onClick={() => setShowModal('')}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>My Profile</h2>
              <button onClick={() => setShowModal('')}>&times;</button>
            </div>
            <form onSubmit={handleProfileUpdate}>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <div className="user-avatar" style={{ width: '120px', height: '120px', fontSize: '2.5rem', ...(profileData.avatar ? { backgroundImage: `url(${profileData.avatar})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}) }}>
                    {!profileData.avatar && profileData.name.substring(0, 2).toUpperCase()}
                  </div>
                  <label htmlFor="avatar-upload" style={{ position: 'absolute', bottom: '0', right: '0', background: 'var(--primary)', color: 'white', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1.2rem' }}>📷</label>
                  <input id="avatar-upload" type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                </div>
              </div>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={profileData.email} disabled style={{ background: '#f8fafc', cursor: 'not-allowed' }} />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input type="tel" value={profileData.phone} onChange={(e) => setProfileData({...profileData, phone: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Department</label>
                <input type="text" value={profileData.department} onChange={(e) => setProfileData({...profileData, department: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Role</label>
                <input type="text" value={profileData.role} onChange={(e) => setProfileData({...profileData, role: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Bio</label>
                <textarea value={profileData.bio} onChange={(e) => setProfileData({...profileData, bio: e.target.value})} rows={3} />
              </div>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={profileData.notifications} onChange={(e) => setProfileData({...profileData, notifications: e.target.checked})} />
                  Enable push notifications
                </label>
              </div>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={profileData.emailAlerts} onChange={(e) => setProfileData({...profileData, emailAlerts: e.target.checked})} />
                  Receive email alerts
                </label>
              </div>
              <button type="submit" className="btn-primary">Update Profile</button>
            </form>
          </div>
        </div>
      )}

      {showCreateTask && (
        <CreateTaskModal
          onClose={() => setShowCreateTask(false)}
          onSuccess={loadData}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
