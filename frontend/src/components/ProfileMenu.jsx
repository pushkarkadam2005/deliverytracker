import React, { useState } from 'react';
import { Menu, MenuItem, ListItemIcon, Divider, Typography, Box, Avatar } from '@mui/material';
import Logout from '@mui/icons-material/Logout';
import Person from '@mui/icons-material/Person';
import Email from '@mui/icons-material/Email';
import Badge from '@mui/icons-material/Badge';
import { useAuth } from '../hooks/useAuth';
import { getRoleDisplayName } from '../utils/roles';

const ProfileMenu = ({ anchorEl, open, onClose }) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <Menu
      anchorEl={anchorEl}
      id="profile-menu"
      open={open}
      onClose={onClose}
      onClick={onClose}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      PaperProps={{
        elevation: 3,
        sx: {
          overflow: 'visible',
          filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
          mt: 1.5,
          minWidth: 220,
          '& .MuiAvatar-root': {
            width: 32,
            height: 32,
            ml: -0.5,
            mr: 1,
          },
          '&::before': {
            content: '""',
            display: 'block',
            position: 'absolute',
            top: 0,
            right: 14,
            width: 10,
            height: 10,
            bgcolor: 'background.paper',
            transform: 'translateY(-50%) rotate(45deg)',
            zIndex: 0,
          },
        },
      }}
    >
      <Box sx={{ px: 2.5, py: 1.5 }}>
        <Typography variant="subtitle1" fontWeight={700} noWrap>
          {user.fullName}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
          <Email sx={{ fontSize: 16 }} /> {user.email}
        </Typography>
        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5, color: '#2563EB', fontWeight: 600 }}>
          <Badge sx={{ fontSize: 16 }} /> {getRoleDisplayName(user.role)}
        </Typography>
      </Box>
      <Divider />
      <MenuItem onClick={logout} sx={{ py: 1.5, color: '#DC2626' }}>
        <ListItemIcon>
          <Logout fontSize="small" sx={{ color: '#DC2626' }} />
        </ListItemIcon>
        Logout
      </MenuItem>
    </Menu>
  );
};

export default ProfileMenu;
