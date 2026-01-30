import { fetchAuthSession } from 'aws-amplify/auth';
import axios, { AxiosInstance } from 'axios';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_ENDPOINT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token to requests
    this.api.interceptors.request.use(
      async (config) => {
        try {
          const session = await fetchAuthSession();
          const token = session.tokens?.idToken?.toString();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.error('Error getting auth token:', error);
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  // Task operations
  async getTasks() {
    const response = await this.api.get('/tasks');
    return response.data;
  }

  async createTask(task: {
    title: string;
    description?: string;
    priority?: string;
    dueDate?: string;
  }) {
    const response = await this.api.post('/tasks', task);
    return response.data;
  }

  async updateTask(
    taskId: string,
    updates: {
      status?: string;
      description?: string;
      priority?: string;
    }
  ) {
    const response = await this.api.put(`/tasks/${taskId}`, updates);
    return response.data;
  }

  async assignTask(taskId: string, userEmail: string) {
    const response = await this.api.post(`/tasks/${taskId}/assign`, {
      userEmail,
    });
    return response.data;
  }
}

export default new ApiService();
