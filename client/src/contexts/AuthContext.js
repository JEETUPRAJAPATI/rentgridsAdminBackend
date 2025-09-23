// import React, { createContext, useContext, useReducer, useEffect } from 'react';
// import { authAPI } from '../services/api';
// import toast from 'react-hot-toast';

// const AuthContext = createContext();

// // Action types
// const AUTH_ACTIONS = {
//   LOGIN_START: 'LOGIN_START',
//   LOGIN_SUCCESS: 'LOGIN_SUCCESS',
//   LOGIN_FAILURE: 'LOGIN_FAILURE',
//   LOGOUT: 'LOGOUT',
//   SET_USER: 'SET_USER',
//   CLEAR_ERROR: 'CLEAR_ERROR'
// };

// // Initial state
// const initialState = {
//   user: null,
//   token: localStorage.getItem('token'),
//   isAuthenticated: false,
//   loading: true,
//   error: null
// };

// // Reducer
// function authReducer(state, action) {
//   switch (action.type) {
//     case AUTH_ACTIONS.LOGIN_START:
//       return {
//         ...state,
//         loading: true,
//         error: null
//       };
//     case AUTH_ACTIONS.LOGIN_SUCCESS:
//       return {
//         ...state,
//         user: action.payload.user,
//         token: action.payload.token,
//         isAuthenticated: true,
//         loading: false,
//         error: null
//       };
//     case AUTH_ACTIONS.LOGIN_FAILURE:
//       return {
//         ...state,
//         user: null,
//         token: null,
//         isAuthenticated: false,
//         loading: false,
//         error: action.payload
//       };
//     case AUTH_ACTIONS.SET_USER:
//       return {
//         ...state,
//         user: action.payload,
//         isAuthenticated: true,
//         loading: false
//       };
//     case AUTH_ACTIONS.LOGOUT:
//       return {
//         ...state,
//         user: null,
//         token: null,
//         isAuthenticated: false,
//         loading: false,
//         error: null
//       };
//     case AUTH_ACTIONS.CLEAR_ERROR:
//       return {
//         ...state,
//         error: null
//       };
//     default:
//       return state;
//   }
// }

// // Provider component
// export function AuthProvider({ children }) {
//   const [state, dispatch] = useReducer(authReducer, initialState);

//   // Check if user is logged in on mount
//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       checkAuthStatus();
//     } else {
//       dispatch({ type: AUTH_ACTIONS.LOGOUT });
//     }
//   }, []);

//   const checkAuthStatus = async () => {
//     try {
//       const response = await authAPI.getProfile();
//       dispatch({
//         type: AUTH_ACTIONS.SET_USER,
//         payload: response.data.user
//       });
//     } catch (error) {
//       localStorage.removeItem('token');
//       dispatch({ type: AUTH_ACTIONS.LOGOUT });
//     }
//   };

//   const login = async (email, password) => {
//     dispatch({ type: AUTH_ACTIONS.LOGIN_START });

//     try {
//       const response = await authAPI.login({ email, password });
      
//       if (response.data.success) {
//         const { access_token, user } = response.data.data;
        
//         localStorage.setItem('token', access_token);
        
//         dispatch({
//           type: AUTH_ACTIONS.LOGIN_SUCCESS,
//           payload: { user, token: access_token }
//         });
        
//         toast.success('Login successful!');
//         return { success: true };
//       } else {
//         throw new Error(response.data.message);
//       }
//     } catch (error) {
//       const errorMessage = error.response?.data?.message || 'Login failed';
      
//       dispatch({
//         type: AUTH_ACTIONS.LOGIN_FAILURE,
//         payload: errorMessage
//       });
      
//       toast.error(errorMessage);
//       return { success: false, error: errorMessage };
//     }
//   };

//   const logout = () => {
//     localStorage.removeItem('token');
//     dispatch({ type: AUTH_ACTIONS.LOGOUT });
//     toast.success('Logged out successfully');
//   };

//   const clearError = () => {
//     dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
//   };

//   const value = {
//     ...state,
//     login,
//     logout,
//     clearError
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// }

// export default AuthContext;




























// // src/contexts/AuthContext.jsx
// import React, { createContext, useContext, useReducer, useEffect } from 'react';
// import { authAPI } from '../services/api';
// import toast from 'react-hot-toast';

// const AuthContext = createContext();

// // Action types
// const AUTH_ACTIONS = {
//   LOGIN_START: 'LOGIN_START',
//   LOGIN_SUCCESS: 'LOGIN_SUCCESS',
//   LOGIN_FAILURE: 'LOGIN_FAILURE',
//   LOGOUT: 'LOGOUT',
//   SET_USER: 'SET_USER',
//   CLEAR_ERROR: 'CLEAR_ERROR'
// };

// // Initial state
// const initialState = {
//   user: JSON.parse(localStorage.getItem('user')) || null,
//   token: localStorage.getItem('token'),
//   isAuthenticated: !!localStorage.getItem('token'),
//   loading: true,
//   error: null
// };

// // Reducer
// function authReducer(state, action) {
//   switch (action.type) {
//     case AUTH_ACTIONS.LOGIN_START:
//       return { ...state, loading: true, error: null };

//     case AUTH_ACTIONS.LOGIN_SUCCESS:
//       return {
//         ...state,
//         user: action.payload.user,
//         token: action.payload.token,
//         isAuthenticated: true,
//         loading: false,
//         error: null
//       };

//     case AUTH_ACTIONS.LOGIN_FAILURE:
//       return {
//         ...state,
//         user: null,
//         token: null,
//         isAuthenticated: false,
//         loading: false,
//         error: action.payload
//       };

//     case AUTH_ACTIONS.SET_USER:
//       return {
//         ...state,
//         user: action.payload,
//         isAuthenticated: true,
//         loading: false
//       };

//     case AUTH_ACTIONS.LOGOUT:
//       return {
//         ...state,
//         user: null,
//         token: null,
//         isAuthenticated: false,
//         loading: false,
//         error: null
//       };

//     case AUTH_ACTIONS.CLEAR_ERROR:
//       return { ...state, error: null };

//     default:
//       return state;
//   }
// }

// // Provider component
// export function AuthProvider({ children }) {
//   const [state, dispatch] = useReducer(authReducer, initialState);

//   // Check auth on mount
//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       checkAuthStatus();
//     } else {
//       dispatch({ type: AUTH_ACTIONS.LOGOUT });
//     }
//   }, []);

//   // Verify token / get profile
//   const checkAuthStatus = async () => {
//     try {
//       const response = await authAPI.getProfile();
//       dispatch({
//         type: AUTH_ACTIONS.SET_USER,
//         payload: response.data.user
//       });
//     } catch (error) {
//       const storedUser = JSON.parse(localStorage.getItem('user'));
//       if (storedUser) {
//         dispatch({
//           type: AUTH_ACTIONS.SET_USER,
//           payload: storedUser
//         });
//       } else {
//         localStorage.removeItem('token');
//         localStorage.removeItem('user');
//         dispatch({ type: AUTH_ACTIONS.LOGOUT });
//       }
//     }
//   };

//   // Login
//   const login = async (email, password) => {
//     dispatch({ type: AUTH_ACTIONS.LOGIN_START });

//     try {
//       const response = await authAPI.login({ email, password });

//       if (response.data.success) {
//         const { access_token, user } = response.data.data;

//         // Save to storage
//         localStorage.setItem('token', access_token);
//         localStorage.setItem('user', JSON.stringify(user));

//         dispatch({
//           type: AUTH_ACTIONS.LOGIN_SUCCESS,
//           payload: { user, token: access_token }
//         });

//         toast.success('Login successful!');
//         return { success: true };
//       } else {
//         throw new Error(response.data.message);
//       }
//     } catch (error) {
//       const errorMessage = error.response?.data?.message || 'Login failed';

//       dispatch({
//         type: AUTH_ACTIONS.LOGIN_FAILURE,
//         payload: errorMessage
//       });

//       toast.error(errorMessage);
//       return { success: false, error: errorMessage };
//     }
//   };

//   // Logout
//   const logout = () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     dispatch({ type: AUTH_ACTIONS.LOGOUT });
//     toast.success('Logged out successfully');
//   };

//   // Clear error
//   const clearError = () => {
//     dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
//   };

//   const value = {
//     ...state,
//     login,
//     logout,
//     clearError
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// // Hook
// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// }

// export default AuthContext;










import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  SET_USER: 'SET_USER',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: true,
  error: null,
};

function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return { ...state, loading: true, error: null };
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      };
    case AUTH_ACTIONS.SET_USER:
      return { ...state, user: action.payload, isAuthenticated: true, loading: false };
    case AUTH_ACTIONS.LOGOUT:
      return { ...state, user: null, token: null, isAuthenticated: false, loading: false, error: null };
    case AUTH_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      checkAuthStatus();
    } else {
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await authAPI.getProfile();
      dispatch({ type: AUTH_ACTIONS.SET_USER, payload: response.data.user });
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  const login = async (email, password) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    try {
      const response = await authAPI.login({ email, password });
      if (response.data.success) {
        const { access_token, user } = response.data.data;
        localStorage.setItem('token', access_token);
        localStorage.setItem('user', JSON.stringify(user));
        dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: { user, token: access_token } });
        toast.success('Login successful!');
        return { success: true };
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
    toast.success('Logged out successfully');
  };

  const clearError = () => dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

  return <AuthContext.Provider value={{ ...state, login, logout, clearError }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

export default AuthContext;

// import React, { createContext, useContext, useReducer, useEffect } from 'react';
// import { authAPI } from '../services/api';
// import toast from 'react-hot-toast';

// const AuthContext = createContext();

// const AUTH_ACTIONS = {
//   LOGIN_START: 'LOGIN_START',
//   LOGIN_SUCCESS: 'LOGIN_SUCCESS',
//   LOGIN_FAILURE: 'LOGIN_FAILURE',
//   LOGOUT: 'LOGOUT',
//   SET_USER: 'SET_USER',
//   CLEAR_ERROR: 'CLEAR_ERROR',
// };

// const initialState = {
//   user: JSON.parse(localStorage.getItem('user')) || null,
//   token: localStorage.getItem('token'),
//   isAuthenticated: !!localStorage.getItem('token'),
//   loading: true,
//   error: null,
// };

// function authReducer(state, action) {
//   switch (action.type) {
//     case AUTH_ACTIONS.LOGIN_START:
//       return { ...state, loading: true, error: null };
//     case AUTH_ACTIONS.LOGIN_SUCCESS:
//       return {
//         ...state,
//         user: action.payload.user,
//         token: action.payload.token,
//         isAuthenticated: true,
//         loading: false,
//         error: null,
//       };
//     case AUTH_ACTIONS.LOGIN_FAILURE:
//       return {
//         ...state,
//         user: null,
//         token: null,
//         isAuthenticated: false,
//         loading: false,
//         error: action.payload,
//       };
//     case AUTH_ACTIONS.SET_USER:
//       return { ...state, user: action.payload, isAuthenticated: true, loading: false };
//     case AUTH_ACTIONS.LOGOUT:
//       return { ...state, user: null, token: null, isAuthenticated: false, loading: false, error: null };
//     case AUTH_ACTIONS.CLEAR_ERROR:
//       return { ...state, error: null };
//     default:
//       return state;
//   }
// }

// export function AuthProvider({ children }) {
//   const [state, dispatch] = useReducer(authReducer, initialState);

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       checkAuthStatus();
//     } else {
//       dispatch({ type: AUTH_ACTIONS.LOGOUT });
//     }
//   }, []);

//   const checkAuthStatus = async () => {
//     try {
//       const response = await authAPI.getProfile();
//       dispatch({ type: AUTH_ACTIONS.SET_USER, payload: response.data.user });
//     } catch {
//       localStorage.removeItem('token');
//       localStorage.removeItem('user');
//       dispatch({ type: AUTH_ACTIONS.LOGOUT });
//     }
//   };

//   const login = async (email, password) => {
//     dispatch({ type: AUTH_ACTIONS.LOGIN_START });
//     try {
//       const response = await authAPI.login({ email, password });
//       if (response.data.success) {
//         const { access_token, user } = response.data.data;
//         localStorage.setItem('token', access_token);
//         localStorage.setItem('user', JSON.stringify(user));
//         dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: { user, token: access_token } });
//         toast.success('Login successful!');
//         return { success: true };
//       } else {
//         throw new Error(response.data.message);
//       }
//     } catch (error) {
//       const errorMessage = error.response?.data?.message || 'Login failed';
//       dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: errorMessage });
//       toast.error(errorMessage);
//       return { success: false, error: errorMessage };
//     }
//   };

//   const logout = () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     dispatch({ type: AUTH_ACTIONS.LOGOUT });
//     toast.success('Logged out successfully');
//   };

//   const clearError = () => dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

//   return <AuthContext.Provider value={{ ...state, login, logout, clearError }}>{children}</AuthContext.Provider>;
// }

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (!context) throw new Error('useAuth must be used within an AuthProvider');
//   return context;
// }

// export default AuthContext;
