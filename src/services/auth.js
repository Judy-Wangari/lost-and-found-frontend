// src/services/auth.js
import { ref } from 'vue';
import api from './api';

const user = ref(null);
const loading = ref(false);
const error = ref(null);

export function useAuth() {


const loadUserFromStorage = () => {
  const savedUser = sessionStorage.getItem('user');
  if(savedUser){
    user.value = JSON.parse(savedUser);
  }
};

  // Helper functions
  const isAuthenticated = () => !!user.value;
  const isStudent = () => user.value?.role === 'student';
  const isAdmin = () => user.value?.role === 'admin';
  const isSecurity = () => user.value?.role === 'security';
  const isPending = () => user.value?.status === 'pending';

  // ====================== REGISTER ======================
  async function register(formData) {
    loading.value = true;
    error.value = null;

    try {
      const data = new FormData();

      data.append('first_name', formData.first_name);
      data.append('last_name', formData.last_name);
      data.append('email', formData.email);
      data.append('phone_number', formData.phone_number);
      data.append('role', formData.role);
      data.append('password', formData.password);
      data.append('password_confirmation', formData.password_confirmation);

      // Append profile picture only if selected
      if (formData.profile_picture) {
        data.append('profile_picture', formData.profile_picture);
      }

      const response = await api.post('register', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { message, user: userData, token } = response.data;

      // Only save token and user if registration was successful for students
      if (token && userData) {
        user.value = userData;
        sessionStorage.setItem('authToken', token);
        sessionStorage.setItem('user', JSON.stringify(userData));
      }

      return {
        success: true,
        message,
        user: userData,
        token,
      };
    } catch (err) {
      error.value = 
        err.response?.data?.message || 
        err.response?.data?.error || 
        'Registration failed. Please try again.';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // ====================== LOGIN ======================
  async function login(credentials) {
    loading.value = true;
    error.value = null;
    
    sessionStorage.clear();
    localStorage.clear();
    
    try {
      const response = await api.post('login', credentials);

      const { message, user: userData, token } = response.data;

      if (token && userData) {
        user.value = userData;
        sessionStorage.setItem('authToken', token);
        sessionStorage.setItem('user', JSON.stringify(userData));

        return {
          success: true,
          message,
          user: userData,
        };
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      if (err.response?.status === 403) {
        error.value = err.response?.data?.message || 'Your account is pending approval by the Administrator.';
      } else {
        error.value = err.response?.data?.message || 'Invalid email or password.';
      }
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // ====================== LOGOUT ======================
  async function logout() {
    try {
      await api.post('logout');
    } catch (e) {
      console.warn('Backend logout failed, clearing local data anyway.');
    } finally {
      user.value = null;
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('user');
    }
  }

  // ====================== UTILITIES ======================
  function getCurrentUser() {
    return user.value;
  }

  function clearError() {
    error.value = null;
  }

  // Load user from storage on first use
  loadUserFromStorage();

  return {
    // Reactive state
    user,
    loading,
    error,

    // Auth status helpers
    isAuthenticated,
    isStudent,
    isAdmin,
    isSecurity,
    isPending,

    // Methods
    register,
    login,
    logout,
    getCurrentUser,
    clearError,
  };
}