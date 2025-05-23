import axios from 'axios';
import type { Class } from '../types/class';

const API_URL = 'http://localhost:5000/api';

export const classApi = {
  // Get all classes
  getAllClasses: async (): Promise<Class[]> => {
    try {
      const response = await axios.get(`${API_URL}/classes`);
      if (response.data.success) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching classes:', error);
      return [];
    }
  },

  // Create new class
  createClass: async (classData: Class): Promise<Class> => {
    const response = await axios.post(`${API_URL}/classes`, classData);
    return response.data.data;
  },

  // Update class
  updateClass: async (classData: Class): Promise<void> => {
    await axios.put(`${API_URL}/classes/${classData.id}`, classData);
  },

  // Delete class
  deleteClass: async (classId: string): Promise<void> => {
    await axios.delete(`${API_URL}/classes/${classId}`);
  }
}; 