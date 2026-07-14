import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Toolbar,
  Divider,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import PaymentsIcon from '@mui/icons-material/Payments';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import { useAuth } from '../hooks/useAuth';
import { ROLES } from '../utils/roles';

const DRAWER_WIDTH = 260;

const Sidebar = ({ mobileOpen, onMobileClose }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const getMenuLinks = () => {
    switch (user.role) {
      case ROLES.CUSTOMER:
        return [
          { text: 'Dashboard', path: '/customer/dashboard', icon: <DashboardIcon /> },
          { text: 'Book Shipment', path: '/customer/create-shipment', icon: <AddCircleIcon /> },
          { text: 'My Shipments', path: '/customer/shipments', icon: <LocalShippingIcon /> },
          { text: 'Track Package', path: '/customer/track', icon: <LocationOnIcon /> },
        ];
      case ROLES.AGENT:
        return [
          { text: 'Agent Dashboard', path: '/agent/dashboard', icon: <DashboardIcon /> },
          { text: 'Delivery History', path: '/agent/history', icon: <AssignmentTurnedInIcon /> },
          { text: 'Worker Profile', path: '/agent/profile', icon: <PersonIcon /> },
        ];
      case ROLES.ADMIN:
        return [
          { text: 'Admin Dashboard', path: '/admin/dashboard', icon: <DashboardIcon /> },
          { text: 'Shipments Portal', path: '/admin/shipments', icon: <LocalShippingIcon /> },
          { text: 'User Accounts', path: '/admin/users', icon: <PeopleIcon /> },
          { text: 'Rate Cards CRUD', path: '/admin/rate-cards', icon: <PaymentsIcon /> },
          { text: 'Admin Profile', path: '/admin/profile', icon: <PersonIcon /> },
          { text: 'Settings Desk', path: '/admin/settings', icon: <SettingsIcon /> },
        ];
      default:
        return [];
    }
  };

  const menuLinks = getMenuLinks();

  const drawerContent = (
    <Box sx={{ bgcolor: 'background.paper', height: '100%', borderRight: '1px solid', borderColor: 'divider' }}>
      <Toolbar sx={{ px: 2.5, py: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <LocalShippingIcon sx={{ fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h6" fontWeight={800} letterSpacing={0.5} color="text.primary">
          DELIVERY TRACK
        </Typography>
      </Toolbar>
      <Divider />
      
      {/* User Quick Info */}
      <Box sx={{ px: 3, py: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <AccountCircleIcon sx={{ fontSize: 40, color: 'text.secondary', opacity: 0.5 }} />
        <Box overflow="hidden">
          <Typography variant="body2" fontWeight={800} color="text.primary" noWrap>
            {user.fullName}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
            {user.role === 'AGENT' ? 'Delivery Agent' : user.role.toLowerCase()}
          </Typography>
        </Box>
      </Box>
      <Divider sx={{ mb: 1 }} />

      <List sx={{ px: 1.5 }}>
        {menuLinks.map((link) => {
          const isActive = location.pathname.startsWith(link.path);
          return (
            <ListItem key={link.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={NavLink}
                to={link.path}
                onClick={onMobileClose}
                sx={{
                  borderRadius: 2,
                  py: 1.25,
                  px: 2,
                  bgcolor: isActive ? 'primary.main' : 'transparent',
                  color: isActive ? 'primary.contrastText' : 'text.secondary',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    bgcolor: isActive ? 'primary.main' : 'action.hover',
                    color: isActive ? 'primary.contrastText' : 'text.primary',
                    '& .MuiListItemIcon-root': {
                      color: isActive ? 'primary.contrastText' : 'text.primary',
                    },
                  },
                  '& .MuiListItemIcon-root': {
                    color: isActive ? 'primary.contrastText' : 'text.secondary',
                    minWidth: 40,
                  },
                }}
              >
                <ListItemIcon>{link.icon}</ListItemIcon>
                <ListItemText
                  primary={link.text}
                  primaryTypographyProps={{
                    fontSize: '0.9rem',
                    fontWeight: isActive ? 700 : 600,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
    >
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }} // Better open performance on mobile
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, border: 'none' },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, border: 'none' },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
export { DRAWER_WIDTH };
