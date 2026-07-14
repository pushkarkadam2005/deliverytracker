import React from 'react';
import { Box, Button, Typography, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import BlockIcon from '@mui/icons-material/Block';
import ErrorIcon from '@mui/icons-material/Error';

const ErrorPage = ({ status = 404, title, message }) => {
  const navigate = useNavigate();

  const getDetails = () => {
    switch (status) {
      case 403:
        return {
          icon: <BlockIcon sx={{ fontSize: 100, color: '#DC2626' }} />,
          defaultTitle: 'Customs Clearance Denied (403)',
          defaultMessage: "You don't have the required administrative clearance to access this cargo dock.",
        };
      case 500:
        return {
          icon: <ErrorIcon sx={{ fontSize: 100, color: '#EF4444' }} />,
          defaultTitle: 'Sorting Conveyor Breakdown (500)',
          defaultMessage: 'Our server encountered an internal sorting issue. Please try dispatching again later.',
        };
      case 404:
      default:
        return {
          icon: <LocalShippingIcon sx={{ fontSize: 100, color: '#F59E0B' }} />,
          defaultTitle: 'Package Lost in Transit (404)',
          defaultMessage: "The warehouse location or shipment route you are searching for does not exist in our systems.",
        };
    }
  };

  const { icon, defaultTitle, defaultMessage } = getDetails();

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          gap: 3,
        }}
      >
        <Box sx={{ animation: 'wiggle 2s infinite alternate', '@keyframes wiggle': {
          '0%': { transform: 'rotate(-3deg)' },
          '100%': { transform: 'rotate(3deg)' }
        }}}>
          {icon}
        </Box>
        <Typography variant="h4" fontWeight={800} color="text.primary">
          {title || defaultTitle}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {message || defaultMessage}
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/')}
          sx={{
            bgcolor: '#2563EB',
            '&:hover': { bgcolor: '#1D4ED8' },
            fontWeight: 700,
            px: 4,
            py: 1.5,
            borderRadius: 2,
            boxShadow: '0 4px 14px 0 rgba(37,99,235,0.4)',
          }}
        >
          Back to Dashboard
        </Button>
      </Box>
    </Container>
  );
};

export default ErrorPage;
