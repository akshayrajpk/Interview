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



# Parent component

import React, {
  useState,
  useCallback,
  useEffect,
  useMemo
} from 'react';
import ChildForm from './ChildForm';

const ParentForm = () => {

  const initialForm = {
      personal: {
        firstName: '',
        lastName: ''
      },
      address: {
        city: '',
        country: ''
      },
      preferences: {
        newsletter: false,
        roles: []
      }
    };


  const [formData, setFormData] = useState(initialForm);
  const [isValid, setIsValid] = useState(false);

  // Callback to receive data from child
  const handleChildChange = useCallback((section, data) => {
    setFormData(prev => ({
      ...prev,
      [section]: data
    }));
  }, []);

  // Derived state (reactive)
  const fullName = useMemo(() => {
    return `${formData.personal.firstName} ${formData.personal.lastName}`.trim();
  }, [formData.personal]);

  // Validation watcher
  useEffect(() => {
    const valid =
      formData.personal.firstName &&
      formData.personal.lastName &&
      formData.address.city;

    setIsValid(Boolean(valid));
  }, [formData]);

  return (
    <div>
      <h2>Parent Form</h2>
      <p><b>Full Name:</b> {fullName}</p>

      <ChildForm
        personal={formData.personal}
        address={formData.address}
        onChange={handleChildChange}
      />

      <button disabled={!isValid}>
        Submit
      </button>
    </div>
  );
};

export default ParentForm;


# Child Component

import React, {
  useState,
  useEffect,
  useRef
} from 'react';

const ChildForm = ({ personal, address, onChange }) => {

  const [localPersonal, setLocalPersonal] = useState(personal);
  const [localAddress, setLocalAddress] = useState(address);

  const firstInputRef = useRef(null);

  // Focus first input on mount
  useEffect(() => {
    firstInputRef.current.focus();
  }, []);

  // Sync parent → child
  useEffect(() => {
    setLocalPersonal(personal);
  }, [personal]);

  useEffect(() => {
    setLocalAddress(address);
  }, [address]);

  // Child → Parent communication
  useEffect(() => {
    onChange('personal', localPersonal);
  }, [localPersonal, onChange]);

  useEffect(() => {
    onChange('address', localAddress);
  }, [localAddress, onChange]);

  return (
    <div>
      <h3>Child Form</h3>

      <input
        ref={firstInputRef}
        type="text"
        placeholder="First Name"
        value={localPersonal.firstName}
        onChange={e =>
          setLocalPersonal({
            ...localPersonal,
            firstName: e.target.value
          })
        }
      />

      <input
        type="text"
        placeholder="Last Name"
        value={localPersonal.lastName}
        onChange={e =>
          setLocalPersonal({
            ...localPersonal,
            lastName: e.target.value
          })
        }
      />

      <input
        type="text"
        placeholder="City"
        value={localAddress.city}
        onChange={e =>
          setLocalAddress({
            ...localAddress,
            city: e.target.value
          })
        }
      />

      <input
        type="text"
        placeholder="Country"
        value={localAddress.country}
        onChange={e =>
          setLocalAddress({
            ...localAddress,
            country: e.target.value
          })
        }
      />
    </div>
  );
};

export default ChildForm;



