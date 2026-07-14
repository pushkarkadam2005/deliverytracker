import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  TextField,
  Button,
  Typography,
  Box,
  InputAdornment,
  IconButton,
  Link,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PhoneIcon from '@mui/icons-material/Phone';
import HomeIcon from '@mui/icons-material/Home';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { ROLES } from '../../utils/roles';

const Register = () => {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [role, setRole] = useState(ROLES.CUSTOMER); // Default to CUSTOMER
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [defaultAddress, setDefaultAddress] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRoleChange = (e, newRole) => {
    if (newRole !== null) {
      setRole(newRole);
      setErrorMsg('');
    }
  };

  const handleTogglePassword = () => setShowPassword(!showPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !password || !phone) {
      setErrorMsg('Please fill in all basic fields.');
      return;
    }

    if (role === ROLES.CUSTOMER && !defaultAddress) {
      setErrorMsg('Default address is required for customers.');
      return;
    }

    if (role === ROLES.AGENT && !vehicleNumber) {
      setErrorMsg('Vehicle registration number is required for agents.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const payload = {
      fullName,
      email,
      password,
      role,
      phone,
      ...(role === ROLES.CUSTOMER ? { defaultAddress } : { vehicleNumber }),
    };

    try {
      await register(payload);
      showToast('Registration successful! Please log in.', 'success');
      navigate('/login');
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err.response?.data?.message || 'Registration failed. Email may already be registered.'
      );
      showToast('Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Typography variant="h5" fontWeight={800} color="#1E293B" align="center" gutterBottom>
        Create Account
      </Typography>
      <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
        Register on the delivery tracking system
      </Typography>

      <Box display="flex" flexDirection="column" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1 }}>
          I WANT TO REGISTER AS A:
        </Typography>
        <ToggleButtonGroup
          color="primary"
          value={role}
          exclusive
          onChange={handleRoleChange}
          fullWidth
          size="small"
        >
          <ToggleButton value={ROLES.CUSTOMER} sx={{ fontWeight: 700 }}>
            Customer
          </ToggleButton>
          <ToggleButton value={ROLES.AGENT} sx={{ fontWeight: 700 }}>
            Delivery Agent
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {errorMsg && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMsg}
        </Alert>
      )}

      <TextField
        margin="normal"
        required
        fullWidth
        id="fullName"
        label="Full Name"
        name="fullName"
        autoComplete="name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <PersonIcon sx={{ color: '#64748B' }} />
            </InputAdornment>
          ),
        }}
      />

      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="Email Address"
        name="email"
        autoComplete="email"
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
        autoComplete="new-password"
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

      <TextField
        margin="normal"
        required
        fullWidth
        id="phone"
        label="Phone Number"
        name="phone"
        autoComplete="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <PhoneIcon sx={{ color: '#64748B' }} />
            </InputAdornment>
          ),
        }}
      />

      {role === ROLES.CUSTOMER ? (
        <TextField
          margin="normal"
          required
          fullWidth
          id="defaultAddress"
          label="Default Delivery Address"
          name="defaultAddress"
          multiline
          rows={2}
          value={defaultAddress}
          onChange={(e) => setDefaultAddress(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                <HomeIcon sx={{ color: '#64748B' }} />
              </InputAdornment>
            ),
          }}
        />
      ) : (
        <TextField
          margin="normal"
          required
          fullWidth
          id="vehicleNumber"
          label="Vehicle License Number (e.g. DL-3C-XY-9999)"
          name="vehicleNumber"
          placeholder="DL-3C-XY-9999"
          value={vehicleNumber}
          onChange={(e) => setVehicleNumber(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <DirectionsCarIcon sx={{ color: '#64748B' }} />
              </InputAdornment>
            ),
          }}
        />
      )}

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
          mt: 2,
          mb: 3,
        }}
      >
        {loading ? 'Creating Account...' : 'Sign Up'}
      </Button>

      <Box display="flex" justifyContent="center">
        <Typography variant="body2" color="text.secondary">
          Already have an account?{' '}
          <Link component={RouterLink} to="/login" sx={{ color: '#2563EB', fontWeight: 700, textDecoration: 'none' }}>
            Sign In
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default Register;
