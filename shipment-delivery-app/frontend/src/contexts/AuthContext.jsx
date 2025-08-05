import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isLoading: true,
  isAuthenticated: false,
}

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  LOAD_USER_START: 'LOAD_USER_START',
  LOAD_USER_SUCCESS: 'LOAD_USER_SUCCESS',
  LOAD_USER_FAILURE: 'LOAD_USER_FAILURE',
  UPDATE_USER: 'UPDATE_USER',
}

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.LOAD_USER_START:
      return {
        ...state,
        isLoading: true,
      }

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
      }

    case AUTH_ACTIONS.LOAD_USER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload,
      }

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.LOAD_USER_FAILURE:
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
      }

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      }

    default:
      return state
  }
}

// Create context
const AuthContext = createContext()

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Load user on app start
  useEffect(() => {
    if (state.token) {
      loadUser()
    } else {
      dispatch({ type: AUTH_ACTIONS.LOAD_USER_FAILURE })
    }
  }, [])

  // Load user function
  const loadUser = async () => {
    dispatch({ type: AUTH_ACTIONS.LOAD_USER_START })

    try {
      const response = await authAPI.getMe()
      dispatch({
        type: AUTH_ACTIONS.LOAD_USER_SUCCESS,
        payload: response.data.data,
      })
    } catch (error) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      dispatch({ type: AUTH_ACTIONS.LOAD_USER_FAILURE })
    }
  }

  // Login function
  const login = async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START })

    try {
      const response = await authAPI.login(credentials)
      const { token, user } = response.data

      // Store token and user
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { token, user },
      })

      toast.success('Login successful!')
      return { success: true }
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE })
      return { success: false, error: error.response?.data?.message || 'Login failed' }
    }
  }

  // Register function
  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData)
      const { token, user } = response.data

      // Store token and user
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { token, user },
      })

      toast.success('Registration successful!')
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Registration failed' }
    }
  }

  // Logout function
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    dispatch({ type: AUTH_ACTIONS.LOGOUT })
    toast.success('Logged out successfully')
  }

  // Update user function
  const updateUser = (userData) => {
    dispatch({
      type: AUTH_ACTIONS.UPDATE_USER,
      payload: userData,
    })
  }

  // Update profile function
  const updateProfile = async (data) => {
    try {
      const response = await authAPI.updateProfile(data)
      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: response.data.data,
      })
      toast.success('Profile updated successfully!')
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Update failed' }
    }
  }

  // Update password function
  const updatePassword = async (data) => {
    try {
      await authAPI.updatePassword(data)
      toast.success('Password updated successfully!')
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Password update failed' }
    }
  }

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    updateProfile,
    updatePassword,
    loadUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
