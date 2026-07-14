import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Button,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import ErrorIcon from '@mui/icons-material/Error';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { notificationService, shipmentService } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import Loader from '../../components/Loader';
import { formatDate, formatWeight } from '../../utils/format';

const AgentDashboard = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Stats Counters
  const [stats, setStats] = useState({
    assigned: 0,
    completedToday: 0,
    pending: 0,
    failed: 0,
  });

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      // 1. Read assignments from notification inbox triggers
      const notifsRes = await notificationService.getMyNotifications(0, 100);
      const notifications = notifsRes.content || [];
      
      const trackingRegex = /(TRK-\d{4}-\d{5}|DLT-\d{4}-[A-Z0-9]{8})/i;
      const trackingIds = new Set();
      
      notifications.forEach((n) => {
        const match = n.message.match(trackingRegex);
        if (match && match[1]) {
          trackingIds.add(match[1].toUpperCase());
        }
      });

      // 2. Fetch shipment specs for each ID
      const promises = Array.from(trackingIds).map(async (id) => {
        try {
          return await shipmentService.getByTracking(id);
        } catch {
          return null;
        }
      });

      const list = (await Promise.all(promises)).filter((s) => s !== null);
      setAssignments(list);

      // 3. Compute Stats
      const assigned = list.length;
      const completedToday = list.filter((s) => s.shipmentStatus === 'DELIVERED').length;
      const failed = list.filter((s) => s.shipmentStatus === 'FAILED').length;
      const pending = list.filter(
        (s) => s.shipmentStatus !== 'DELIVERED' && s.shipmentStatus !== 'FAILED' && s.shipmentStatus !== 'CANCELLED'
      ).length;

      setStats({ assigned, completedToday, pending, failed });
    } catch (err) {
      console.error(err);
      showToast('Error loading active assigned deliveries list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const getStatusChip = (status) => {
    let color = 'default';
    switch (status) {
      case 'CREATED': color = 'primary'; break;
      case 'ASSIGNED': color = 'info'; break;
      case 'PICKED_UP':
      case 'IN_TRANSIT':
      case 'OUT_FOR_DELIVERY': color = 'warning'; break;
      case 'DELIVERED': color = 'success'; break;
      case 'FAILED':
      case 'CANCELLED': color = 'error'; break;
    }
    return <Chip label={status} color={color} size="small" sx={{ fontWeight: 700 }} />;
  };

  if (loading) {
    return <Loader message="Accessing active assigned routes..." />;
  }

  // Filter only active deliveries for dashboard table
  const activeDeliveries = assignments.filter(
    (s) => s.shipmentStatus !== 'DELIVERED' && s.shipmentStatus !== 'CANCELLED'
  );

  return (
    <Box className="fade-in">
      <Typography variant="h5" fontWeight={800} color="#1E293B" sx={{ mb: 3 }}>
        Agent Delivery Center
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Assigned Deliveries */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #E2E8F0' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2.5 }}>
              <Box sx={{ p: 1.5, bgcolor: 'rgba(37,99,235,0.1)', borderRadius: 2, color: '#2563EB' }}>
                <LocalShippingIcon sx={{ fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  Assigned Deliveries
                </Typography>
                <Typography variant="h4" fontWeight={800} color="#1E293B">
                  {stats.assigned}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Completed Today */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #E2E8F0' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2.5 }}>
              <Box sx={{ p: 1.5, bgcolor: 'rgba(16,185,129,0.1)', borderRadius: 2, color: '#10B981' }}>
                <CheckCircleIcon sx={{ fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  Completed Today
                </Typography>
                <Typography variant="h4" fontWeight={800} color="#1E293B">
                  {stats.completedToday}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Pending */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #E2E8F0' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2.5 }}>
              <Box sx={{ p: 1.5, bgcolor: 'rgba(245,158,11,0.1)', borderRadius: 2, color: '#F59E0B' }}>
                <PendingActionsIcon sx={{ fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  Pending
                </Typography>
                <Typography variant="h4" fontWeight={800} color="#1E293B">
                  {stats.pending}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Failed */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #E2E8F0' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2.5 }}>
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

      {/* Assigned Deliveries Table */}
      <Card sx={{ borderRadius: 4, boxShadow: '0 8px 24px rgba(0,0,0,0.04)', border: '1px solid #E2E8F0' }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="subtitle1" fontWeight={800} color="#1E293B" sx={{ mb: 2.5 }}>
            Active Assigned Deliveries
          </Typography>

          <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #E2E8F0', borderRadius: 3 }}>
            <Table>
              <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Tracking ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Receiver (Drop Target)</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Pincode</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Weight</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activeDeliveries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">No active delivery assignments found.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  activeDeliveries.map((row) => (
                    <TableRow key={row.trackingNumber} hover>
                      <TableCell fontWeight={700} color="#1E3A8A">{row.trackingNumber}</TableCell>
                      <TableCell>{row.receiverName}</TableCell>
                      <TableCell fontWeight={600}>{row.deliveryPincode}</TableCell>
                      <TableCell>{getStatusChip(row.shipmentStatus)}</TableCell>
                      <TableCell>{formatWeight(row.billableWeight)}</TableCell>
                      <TableCell align="center">
                        <Button
                          variant="outlined"
                          size="small"
                          endIcon={<ArrowForwardIcon />}
                          onClick={() => navigate(`/agent/shipments/${row.trackingNumber}`)}
                          sx={{ fontWeight: 700, borderRadius: 2 }}
                        >
                          Update status
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AgentDashboard;
