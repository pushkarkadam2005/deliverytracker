import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  InputAdornment,
  Paper,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ErrorIcon from '@mui/icons-material/Error';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { shipmentService } from '../../services/api';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [searchTracking, setSearchTracking] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    delivered: 0,
    failed: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await shipmentService.getMyShipments(0, 100);
        const shipments = response.content || [];
        const total = shipments.length;
        const delivered = shipments.filter(s => s.shipmentStatus === 'DELIVERED').length;
        const failed = shipments.filter(s => s.shipmentStatus === 'FAILED').length;
        const active = total - delivered - failed - shipments.filter(s => s.shipmentStatus === 'CANCELLED').length;
        setStats({ total, active, delivered, failed });
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      }
    };
    fetchStats();
  }, []);

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (!searchTracking.trim()) return;
    navigate(`/customer/track?tracking=${searchTracking.trim()}`);
  };

  return (
    <Box className="fade-in">
      {/* Welcome Banner */}
      <Paper
        sx={{
          p: { xs: 3, md: 4 },
          mb: 4,
          background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
          color: '#ffffff',
          borderRadius: 3,
          boxShadow: '0 10px 20px rgba(37,99,235,0.15)',
        }}
      >
        <Typography variant="h4" fontWeight={800} gutterBottom>
          Hello, {user?.fullName}!
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9, mb: 3 }}>
          Manage your delivery schedules, book cargo shipments, and view real-time package timelines here.
        </Typography>
        
        {/* Quick Track Input */}
        <Box component="form" onSubmit={handleTrackSubmit} sx={{ maxWidth: 500 }}>
          <TextField
            fullWidth
            placeholder="Enter tracking number (e.g. DLT-2026-...)"
            value={searchTracking}
            onChange={(e) => setSearchTracking(e.target.value)}
            sx={{
              bgcolor: '#ffffff',
              borderRadius: 2,
              '& .MuiOutlinedInput-root': {
                '& fieldset': { border: 'none' },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{
                      bgcolor: '#F59E0B',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      borderRadius: 1.5,
                      '&:hover': { bgcolor: '#D97706' },
                    }}
                  >
                    Track
                  </Button>
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Paper>

      {/* Metrics Summary */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Total Orders */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, bgcolor: 'rgba(37,99,235,0.1)', borderRadius: 2, color: '#2563EB' }}>
                <ListAltIcon sx={{ fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  Total Orders
                </Typography>
                <Typography variant="h4" fontWeight={800} color="#1E293B">
                  {stats.total}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Delivered */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, bgcolor: 'rgba(16,185,129,0.1)', borderRadius: 2, color: '#10B981' }}>
                <CheckCircleIcon sx={{ fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  Delivered
                </Typography>
                <Typography variant="h4" fontWeight={800} color="#1E293B">
                  {stats.delivered}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Active */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, bgcolor: 'rgba(245,158,11,0.1)', borderRadius: 2, color: '#F59E0B' }}>
                <LocalShippingIcon sx={{ fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  Active
                </Typography>
                <Typography variant="h4" fontWeight={800} color="#1E293B">
                  {stats.active}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Failed */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, bgcolor: 'rgba(239,68,68,0.1)', borderRadius: 2, color: '#EF4444' }}>
                <ErrorIcon sx={{ fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  Failed
                </Typography>
                <Typography variant="h4" fontWeight={800} color="#1E293B">
                  {stats.failed}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: '#1E293B' }}>
        Quick Dispatch Center
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => navigate('/customer/create-shipment')}
            startIcon={<AddCircleIcon />}
            sx={{
              p: 3,
              borderRadius: 3,
              borderColor: '#2563EB',
              color: '#2563EB',
              borderWidth: 2,
              fontWeight: 700,
              fontSize: '1rem',
              '&:hover': {
                borderWidth: 2,
                bgcolor: 'rgba(37,99,235,0.04)',
                borderColor: '#1D4ED8',
              },
            }}
          >
            Book New Shipping Order
          </Button>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => navigate('/customer/shipments')}
            startIcon={<LocalShippingIcon />}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: '#2563EB',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '1rem',
              '&:hover': { bgcolor: '#1D4ED8' },
              boxShadow: '0 4px 14px rgba(37,99,235,0.25)',
            }}
          >
            Review Shipment Invoices
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CustomerDashboard;
