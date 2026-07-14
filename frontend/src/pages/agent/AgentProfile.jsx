import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Avatar,
  Divider,
  Switch,
  FormControlLabel,
  Chip,
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EmailIcon from '@mui/icons-material/Email';
import BadgeIcon from '@mui/icons-material/Badge';
import PhoneIcon from '@mui/icons-material/Phone';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import StarIcon from '@mui/icons-material/Star';
import { useAuth } from '../../hooks/useAuth';
import { agentService } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import Loader from '../../components/Loader';

const AgentProfile = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [agentProfile, setAgentProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availability, setAvailability] = useState('AVAILABLE');

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await agentService.getProfile();
      setAgentProfile(data);
      setAvailability(data.availabilityStatus || 'AVAILABLE');
    } catch (err) {
      console.error(err);
      showToast('Error retrieving delivery agent details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleAvailabilityToggle = async (e) => {
    const nextStatus = e.target.checked ? 'AVAILABLE' : 'BUSY';
    try {
      await agentService.updateAvailability(nextStatus);
      setAvailability(nextStatus);
      showToast(`Duty status updated to ${nextStatus}`, 'success');
    } catch (err) {
      showToast('Failed to toggle duty status.', 'error');
    }
  };

  if (loading) {
    return <Loader message="Accessing worker profile data..." />;
  }

  return (
    <Box sx={{ maxWidth: 650, mx: 'auto', className: 'fade-in' }}>
      <Card sx={{ borderRadius: 4, boxShadow: '0 8px 24px rgba(0,0,0,0.06)', border: '1px solid #E2E8F0' }}>
        <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar sx={{ bgcolor: '#F59E0B', width: 85, height: 85, mb: 2, boxShadow: '0 4px 12px rgba(245,158,11,0.2)' }}>
            <AccountCircleIcon sx={{ fontSize: 65 }} />
          </Avatar>

          <Typography variant="h5" fontWeight={800} color="#1E293B">
            {user?.fullName || 'Bob Agent'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Delivery Executive (Logistics Crew)
          </Typography>

          <Box display="flex" gap={1.5} sx={{ mb: 3 }}>
            <Chip
              label={availability}
              color={availability === 'AVAILABLE' ? 'success' : 'warning'}
              sx={{ fontWeight: 700 }}
            />
            {agentProfile?.rating && (
              <Chip
                icon={<StarIcon sx={{ '&&': { color: '#F59E0B' } }} />}
                label={`${agentProfile.rating} / 5.0`}
                variant="outlined"
                sx={{ fontWeight: 700 }}
              />
            )}
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={availability === 'AVAILABLE'}
                onChange={handleAvailabilityToggle}
                color="success"
              />
            }
            label={availability === 'AVAILABLE' ? 'Online (Accepting dispatches)' : 'On Duty / Offline (Busy)'}
            sx={{ mb: 3 }}
          />

          <Divider sx={{ width: '100%', mb: 3 }} />

          <Grid container spacing={3} sx={{ width: '100%' }}>
            <Grid item xs={12} sm={6} display="flex" alignItems="center" gap={2}>
              <BadgeIcon sx={{ color: '#F59E0B' }} />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  AGENT CODE
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  AGN-{user?.id || '24'}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} display="flex" alignItems="center" gap={2}>
              <EmailIcon sx={{ color: '#F59E0B' }} />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  EMAIL ADDRESS
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {user?.email || 'agent@deliverytracker.com'}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} display="flex" alignItems="center" gap={2}>
              <PhoneIcon sx={{ color: '#F59E0B' }} />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  CONTACT NUMBER
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {user?.phone || '+91 99999 88888'}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} display="flex" alignItems="center" gap={2}>
              <TwoWheelerIcon sx={{ color: '#F59E0B' }} />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  VEHICLE ASSIGNED
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {agentProfile?.vehicleNumber || 'DL-3C-XY-9999'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AgentProfile;
