import React from 'react';
import { Card, CardContent, Typography, Box, Grid, Avatar, Divider } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EmailIcon from '@mui/icons-material/Email';
import BadgeIcon from '@mui/icons-material/Badge';
import SecurityIcon from '@mui/icons-material/Security';
import { useAuth } from '../../hooks/useAuth';
import { getRoleDisplayName } from '../../utils/roles';

const AdminProfile = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', className: 'fade-in' }}>
      <Card sx={{ borderRadius: 4, boxShadow: '0 8px 24px rgba(0,0,0,0.06)', border: '1px solid #E2E8F0' }}>
        <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar sx={{ bgcolor: '#2563EB', width: 80, height: 80, mb: 2, boxShadow: '0 4px 10px rgba(37,99,235,0.2)' }}>
            <AccountCircleIcon sx={{ fontSize: 60 }} />
          </Avatar>
          
          <Typography variant="h5" fontWeight={800} color="#1E293B">
            {user.fullName}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            System Administrator
          </Typography>

          <Divider sx={{ width: '100%', mb: 3 }} />

          <Grid container spacing={2.5} sx={{ width: '100%' }}>
            <Grid item xs={12} display="flex" alignItems="center" gap={2}>
              <BadgeIcon sx={{ color: '#2563EB' }} />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  USER ACCOUNT ID
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  USR-{user.id || '999'}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} display="flex" alignItems="center" gap={2}>
              <EmailIcon sx={{ color: '#2563EB' }} />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  EMAIL ADDRESS
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {user.email}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} display="flex" alignItems="center" gap={2}>
              <SecurityIcon sx={{ color: '#2563EB' }} />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  ROLE CLEARANCE
                </Typography>
                <Typography variant="body2" fontWeight={600} color="#2563EB">
                  {getRoleDisplayName(user.role)}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminProfile;
