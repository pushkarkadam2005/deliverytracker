import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Card, Container, Typography } from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

const AuthLayout = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #3B82F6 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        px: 2,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          width: '300px',
          height: '300px',
          background: 'rgba(245, 158, 11, 0.15)',
          borderRadius: '50%',
          top: '-100px',
          right: '-100px',
          zIndex: 0,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          width: '400px',
          height: '400px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '50%',
          bottom: '-150px',
          left: '-150px',
          zIndex: 0,
        },
      }}
    >
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: '#FFFFFF',
              borderRadius: '50%',
              p: 2,
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
              mb: 2,
            }}
          >
            <LocalShippingIcon sx={{ fontSize: 40, color: '#2563EB' }} />
          </Box>
          <Typography variant="h4" fontWeight={900} color="#FFFFFF" letterSpacing={0.5}>
            DELIVERY TRACKER
          </Typography>
          <Typography variant="body2" color="rgba(255, 255, 255, 0.8)" sx={{ mt: 0.5 }}>
            Express Logistics & Operations Platform
          </Typography>
        </Box>

        <Card
          sx={{
            borderRadius: 4,
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            p: { xs: 3, sm: 4 },
          }}
        >
          <Outlet />
        </Card>
      </Container>
    </Box>
  );
};

export default AuthLayout;
