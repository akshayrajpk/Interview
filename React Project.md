school-management/
├── public/
├── src/
│   ├── app/
│   │   └── store.js
│   ├── features/
│   │   ├── auth/
│   │   │   ├── authSlice.js
│   │   │   └── authThunks.js
│   │   ├── students/
│   │   │   ├── studentSlice.js
│   │   │   └── studentThunks.js
│   ├── components/
│   │   ├── common/
│   │   │   └── Input.js
│   │   ├── Login.js
│   │   ├── Dashboard.js
│   │   └── StudentForm.js
│   ├── hooks/
│   │   └── useAuth.js
│   ├── routes/
│   │   └── ProtectedRoute.js
│   ├── services/
│   │   └── api.js
│   ├── App.js
│   └── index.js
├── README.md
└── package.json


# store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import studentReducer from '../features/students/studentSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    students: studentReducer
  }
});

# auth authThunks
import { createAsyncThunk } from '@reduxjs/toolkit';

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials) => {
    // simulate API
    return new Promise((resolve) =>
      setTimeout(() => {
        resolve({
          name: credentials.username,
          role: credentials.username === 'admin' ? 'ADMIN' : 'TEACHER'
        });
      }, 800)
    );
  }
);

# auth authSlice
import { createSlice } from '@reduxjs/toolkit';
import { loginUser } from './authThunks';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    status: 'idle'
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    }
  },
  extraReducers: builder => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.status = 'succeeded';
      });
  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;

# useAuth
import { useSelector } from 'react-redux';

export const useAuth = () => {
  const { isAuthenticated, user } = useSelector(state => state.auth);
  return { isAuthenticated, user };
};


# login
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginUser } from '../features/auth/authThunks';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submit = async () => {
    await dispatch(loginUser({ username }));
    navigate('/dashboard');
  };

  return (
    <div>
      <h2>Login</h2>
      <input value={username} onChange={e => setUsername(e.target.value)} />
      <button onClick={submit}>Login</button>
    </div>
  );
}

# ProtectedRoute
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/" />;
}

# studentSlice.js
import { createSlice } from '@reduxjs/toolkit';

const studentSlice = createSlice({
  name: 'students',
  initialState: [],
  reducers: {
    addStudent: (state, action) => {
      state.push(action.payload);
    }
  }
});

export const { addStudent } = studentSlice.actions;
export default studentSlice.reducer;



# Dashboard.js
import { useSelector } from 'react-redux';
import { useAuth } from '../hooks/useAuth';
import StudentForm from './StudentForm';

export default function Dashboard() {
  const students = useSelector(state => state.students);
  const { user } = useAuth();

  return (
    <div>
      <h2>Welcome {user.name} ({user.role})</h2>
      {user.role === 'ADMIN' && <StudentForm />}
      <ul>
        {students.map((s, i) => (
          <li key={i}>{s.name} - {s.grade}</li>
        ))}
      </ul>
    </div>
  );
}


# School Management System

## Features
- Role-based authentication
- Protected routes
- Redux Toolkit with async thunks
- Custom hooks
- Scalable architecture

## Login
- admin → ADMIN role
- any other name → TEACHER role

## Tech Stack
React, Redux Toolkit, React Router v6

