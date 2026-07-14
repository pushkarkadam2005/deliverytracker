import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

const Loader = ({ message = 'Loading Delivery Tracker...' }) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="60vh"
      gap={3}
    >
      <Box position="relative" display="inline-flex">
        <CircularProgress
          size={80}
          thickness={4}
          sx={{
            color: '#2563EB',
          }}
        />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <LocalShippingIcon
            sx={{
              fontSize: 36,
              color: '#F59E0B',
              animation: 'bounce 1s infinite alternate',
              '@keyframes bounce': {
                '0%': { transform: 'translateY(0)' },
                '100%': { transform: 'translateY(-6px)' }
              }
            }}
          />
        </Box>
      </Box>
      <Typography variant="h6" color="text.secondary" fontWeight={500}>
        {message}
      </Typography>
    </Box>
  );
};

export default Loader;
