import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { TextField, Button, Typography, Box, InputAdornment, Link, Alert } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import { useToast } from '../../hooks/useToast';

const ForgotPassword = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter your registered email address.');
      return;
    }

    setErrorMsg('');
    setSuccess(true);
    showToast('Reset link has been dispatched to your email!', 'success');
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Typography variant="h5" fontWeight={800} color="#1E293B" align="center" gutterBottom>
        Reset Password
      </Typography>
      <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
        Enter your email address to recover your account credentials
      </Typography>

      {success ? (
        <Box>
          <Alert severity="success" sx={{ mb: 3 }}>
            A temporary password recovery link has been dispatched to <strong>{email}</strong>. Please check your inbox and spam folder.
          </Alert>
          <Button
            component={RouterLink}
            to="/login"
            fullWidth
            variant="contained"
            sx={{
              bgcolor: '#2563EB',
              fontWeight: 700,
              py: 1.5,
              borderRadius: 2,
              '&:hover': { bgcolor: '#1D4ED8' },
            }}
          >
            Back to Sign In
          </Button>
        </Box>
      ) : (
        <Box>
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

          <Button
            type="submit"
            fullWidth
            variant="contained"
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
            Send Reset Instructions
          </Button>

          <Box display="flex" justifyContent="center">
            <Typography variant="body2" color="text.secondary">
              Remember your password?{' '}
              <Link component={RouterLink} to="/login" sx={{ color: '#2563EB', fontWeight: 700, textDecoration: 'none' }}>
                Sign In
              </Link>
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ForgotPassword;
