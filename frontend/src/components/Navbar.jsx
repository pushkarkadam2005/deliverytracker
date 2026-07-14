import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Badge,
  Box,
  Avatar,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { useColorMode } from '../context/ThemeContext';
import { notificationService } from '../services/api';
import ProfileMenu from './ProfileMenu';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ onSidebarToggle, pageTitle = 'Dashboard' }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const theme = useTheme();
  const colorMode = useColorMode();
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);
  
  // Notification State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getMyNotifications(0, 5);
      setNotifications(data.content || []);
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleProfileOpen = (e) => setProfileAnchor(e.currentTarget);
  const handleProfileClose = () => setProfileAnchor(null);

  const handleNotifOpen = (e) => {
    setNotifAnchor(e.currentTarget);
    fetchNotifications();
  };
  const handleNotifClose = () => setNotifAnchor(null);

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.isRead) {
        await notificationService.markRead(notif.id);
        fetchNotifications();
      }
      handleNotifClose();
      
      const trackingRegex = /(TRK-\d{4}-\d{5}|DLT-\d{4}-[A-Z0-9]{8})/i;
      const match = notif.message.match(trackingRegex);
      if (match && match[1]) {
        const trackingNum = match[1];
        if (user.role === 'ADMIN') {
          navigate(`/admin/shipments?search=${trackingNum}`);
        } else if (user.role === 'CUSTOMER') {
          navigate(`/customer/track?tracking=${trackingNum}`);
        } else if (user.role === 'AGENT') {
          navigate(`/agent/shipments/${trackingNum}`);
        }
      } else {
        showToast('Notification details: ' + notif.message, 'info');
      }
    } catch (err) {
      showToast('Error marking notification as read', 'error');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const unreadNotifs = notifications.filter(n => !n.isRead);
      for (const n of unreadNotifs) {
        await notificationService.markRead(n.id);
      }
      fetchNotifications();
      showToast('All notifications marked as read', 'success');
      handleNotifClose();
    } catch (err) {
      showToast('Failed to mark notifications as read', 'error');
    }
  };

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        bgcolor: 'background.paper', 
        color: 'text.primary', 
        boxShadow: 'none',
        borderBottom: '1px solid',
        borderColor: 'divider',
        zIndex: 1201 
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onSidebarToggle}
          sx={{ mr: 2, display: { md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 800, flexGrow: 1, letterSpacing: '-0.015em' }}>
          {pageTitle}
        </Typography>

        <Box display="flex" alignItems="center" gap={1.5}>
          {/* Light/Dark Toggle Switch */}
          <IconButton color="inherit" onClick={colorMode.toggleColorMode}>
            {theme.palette.mode === 'dark' ? (
              <Brightness7Icon sx={{ color: '#FBBF24' }} />
            ) : (
              <Brightness4Icon sx={{ color: '#64748B' }} />
            )}
          </IconButton>

          {/* Notification Bell */}
          <IconButton color="inherit" onClick={handleNotifOpen}>
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon sx={{ color: 'text.secondary' }} />
            </Badge>
          </IconButton>

          {/* Notification Dropdown Drawer */}
          <Menu
            anchorEl={notifAnchor}
            open={Boolean(notifAnchor)}
            onClose={handleNotifClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              elevation: 4,
              sx: { 
                width: 320, 
                maxHeight: 400, 
                mt: 1.5, 
                overflow: 'auto',
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider'
              },
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle2" fontWeight={800}>
                Notifications
              </Typography>
              {unreadCount > 0 && (
                <Button size="small" onClick={handleMarkAllRead} startIcon={<MarkEmailReadIcon />} sx={{ fontSize: '0.75rem' }}>
                  Mark all read
                </Button>
              )}
            </Box>
            <Divider />
            <List sx={{ p: 0 }}>
              {notifications.length === 0 ? (
                <ListItem sx={{ py: 3, justifyContent: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No notifications
                  </Typography>
                </ListItem>
              ) : (
                notifications.map((notif) => (
                  <React.Fragment key={notif.id}>
                    <MenuItem
                      onClick={() => handleNotificationClick(notif)}
                      sx={{
                        py: 1.5,
                        px: 2.5,
                        bgcolor: notif.isRead ? 'transparent' : 'action.hover',
                        borderLeft: notif.isRead ? 'none' : `4px solid ${theme.palette.primary.main}`,
                        whiteSpace: 'normal',
                      }}
                    >
                      <ListItemText
                        primary={notif.title}
                        secondary={notif.message}
                        primaryTypographyProps={{
                          variant: 'subtitle2',
                          fontWeight: notif.isRead ? 600 : 800,
                          color: 'text.primary',
                        }}
                        secondaryTypographyProps={{
                          variant: 'caption',
                          color: 'text.secondary',
                          sx: { display: 'block', mt: 0.5 },
                        }}
                      />
                    </MenuItem>
                    <Divider />
                  </React.Fragment>
                ))
              )}
            </List>
          </Menu>

          {/* User Profile Avatar Dropdown */}
          <IconButton onClick={handleProfileOpen} sx={{ p: 0.5 }}>
            <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 36, height: 36, fontWeight: 800, fontSize: 15 }}>
              {user?.fullName?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
          </IconButton>

          <ProfileMenu
            anchorEl={profileAnchor}
            open={Boolean(profileAnchor)}
            onClose={handleProfileClose}
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
