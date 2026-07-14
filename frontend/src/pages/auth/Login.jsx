import React, { useState } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import {
  TextField,
  Button,
  Typography,
  Box,
  InputAdornment,
  IconButton,
  Link,
  Alert,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { ROLES } from '../../utils/roles';

const Login = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Extract redirection path if specified
  const from = location.state?.from?.pathname || '';

  // Check if session expired
  const isExpired = new URLSearchParams(location.search).get('expired') === 'true';

  const handleTogglePassword = () => setShowPassword(!showPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const user = await login(email, password);
      showToast(`Welcome back, ${user.fullName}!`, 'success');
      
      // Redirect based on role
      if (from) {
        navigate(from, { replace: true });
      } else {
        if (user.role === ROLES.ADMIN) {
          navigate('/admin/dashboard', { replace: true });
        } else if (user.role === ROLES.CUSTOMER) {
          navigate('/customer/dashboard', { replace: true });
        } else if (user.role === ROLES.AGENT) {
          navigate('/agent/dashboard', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err.response?.data?.message || 'Login failed. Please check your credentials.'
      );
      showToast('Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Typography variant="h5" fontWeight={800} color="#1E293B" align="center" gutterBottom>
        Sign In
      </Typography>
      <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
        Access your logistics shipping dashboard
      </Typography>

      {isExpired && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Your session has expired. Please log in again.
        </Alert>
      )}

      {errorMsg && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMsg}
        </Alert>
      )}

      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="Email Address"
        name="email"
        autoComplete="email"
        autoFocus
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <EmailIcon sx={{ color: '#64748B' }} />
            </InputAdornment>
          ),
        }}
      />

      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="Password"
        type={showPassword ? 'text' : 'password'}
        id="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <LockIcon sx={{ color: '#64748B' }} />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={handleTogglePassword} edge="end">
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Box display="flex" justifyContent="flex-end" sx={{ mt: 1, mb: 2 }}>
        <Link component={RouterLink} to="/forgot-password" variant="body2" sx={{ color: '#2563EB', fontWeight: 600, textDecoration: 'none' }}>
          Forgot password?
        </Link>
      </Box>

      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={loading}
        sx={{
          bgcolor: '#2563EB',
          color: '#FFFFFF',
          fontWeight: 700,
          py: 1.5,
          borderRadius: 2,
          fontSize: '1rem',
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
          '&:hover': {
            bgcolor: '#1D4ED8',
            boxShadow: '0 6px 16px rgba(37, 99, 235, 0.35)',
          },
          mb: 3,
        }}
      >
        {loading ? 'Authenticating...' : 'Sign In'}
      </Button>

      <Box display="flex" justifyContent="center">
        <Typography variant="body2" color="text.secondary">
          Don't have an account?{' '}
          <Link component={RouterLink} to="/register" sx={{ color: '#2563EB', fontWeight: 700, textDecoration: 'none' }}>
            Sign Up
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default Login;
