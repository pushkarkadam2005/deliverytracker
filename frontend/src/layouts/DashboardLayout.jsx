import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Box, Container, CssBaseline, Typography, Link } from '@mui/material';
import Sidebar, { DRAWER_WIDTH } from '../components/Sidebar';
import Navbar from '../components/Navbar';

const DashboardLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const handleSidebarToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMobileClose = () => {
    setMobileOpen(false);
  };

  // Derive page title from pathname
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Dashboard Overview';
    if (path.includes('/create-shipment')) return 'Book New Shipment';
    if (path.includes('/shipments')) return 'Shipments Management';
    if (path.includes('/track')) return 'Live Tracking Center';
    if (path.includes('/users')) return 'User Accounts Portal';
    if (path.includes('/rate-cards')) return 'Billing & Rates Desk';
    return 'Logistics Dashboard';
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <CssBaseline />
      
      {/* Sidebar navigation */}
      <Sidebar mobileOpen={mobileOpen} onMobileClose={handleMobileClose} />

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Top Navbar */}
        <Navbar onSidebarToggle={handleSidebarToggle} pageTitle={getPageTitle()} />

        {/* Content Box */}
        <Box sx={{ flexGrow: 1, p: { xs: 2, sm: 3 } }}>
          <Outlet />
        </Box>

        {/* Footer */}
        <Box
          component="footer"
          sx={{
            py: 3,
            px: 2,
            mt: 'auto',
            bgcolor: 'background.paper',
            borderTop: '1px solid',
            borderColor: 'divider',
            textAlign: 'center',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {'© '}
            <Link color="inherit" href="/" sx={{ fontWeight: 600, textDecoration: 'none' }}>
              Delivery Tracker
            </Link>{' '}
            {new Date().getFullYear()}
            {'. Build v1.0.0. All Rights Reserved.'}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
