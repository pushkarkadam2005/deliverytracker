import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, TextField, Button, Grid, Divider, FormControlLabel, Switch } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { useToast } from '../../hooks/useToast';

const AdminSettings = () => {
  const { showToast } = useToast();

  const [baseUrl, setBaseUrl] = useState(localStorage.getItem('apiBaseUrl') || 'http://localhost:8080');
  const [defaultPageSize, setDefaultPageSize] = useState('10');
  const [enableLogging, setEnableLogging] = useState(true);
  const [notifySms, setNotifySms] = useState(true);

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('apiBaseUrl', baseUrl);
    showToast('Platform configurations updated successfully.', 'success');
  };

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', className: 'fade-in' }}>
      <Card sx={{ borderRadius: 4, boxShadow: '0 8px 24px rgba(0,0,0,0.06)', border: '1px solid #E2E8F0' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" fontWeight={800} color="#1E293B" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <SettingsIcon sx={{ color: '#2563EB' }} /> Platform Global Settings
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Box component="form" onSubmit={handleSave}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="API Server Base URL"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="http://localhost:8080"
                  helperText="Configurable endpoint targeting the Spring Boot backend REST controllers."
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Default Tables Rows Limit"
                  type="number"
                  value={defaultPageSize}
                  onChange={(e) => setDefaultPageSize(e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, mt: 1 }}>
                  Operational Integrations
                </Typography>
                
                <Box display="flex" flexDirection="column" gap={1.5}>
                  <FormControlLabel
                    control={<Switch checked={enableLogging} onChange={(e) => setEnableLogging(e.target.checked)} />}
                    label="Enable client console diagnostic logs"
                  />
                  <FormControlLabel
                    control={<Switch checked={notifySms} onChange={(e) => setNotifySms(e.target.checked)} />}
                    label="Forward SMS alerts to active drivers"
                  />
                </Box>
              </Grid>
            </Grid>

            <Button
              type="submit"
              variant="contained"
              sx={{
                bgcolor: '#2563EB',
                '&:hover': { bgcolor: '#1D4ED8' },
                fontWeight: 700,
                py: 1.5,
                px: 4,
                mt: 4,
                borderRadius: 2,
              }}
            >
              Save Configurations
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminSettings;
