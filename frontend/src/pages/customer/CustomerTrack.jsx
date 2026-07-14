import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Divider,
  Paper,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ErrorIcon from '@mui/icons-material/Error';
import { shipmentService, trackingService } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { formatDate, formatWeight } from '../../utils/format';
import Loader from '../../components/Loader';

const CustomerTrack = () => {
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [inputTracking, setInputTracking] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shipment, setShipment] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Rescheduling state
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduling, setRescheduling] = useState(false);

  // Extract tracking parameter from query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const trk = params.get('tracking');
    if (trk) {
      setTrackingNumber(trk.trim());
      setInputTracking(trk.trim());
    }
  }, [location]);

  // Load shipment and timeline details
  const fetchTrackingDetails = async () => {
    if (!trackingNumber) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const shipData = await shipmentService.getByTracking(trackingNumber);
      const timelineData = await trackingService.getTimeline(trackingNumber);
      setShipment(shipData);
      setTimeline(timelineData.history || []);
    } catch (err) {
      console.error(err);
      setShipment(null);
      setTimeline([]);
      setErrorMsg(err.response?.data?.message || 'Invalid tracking number. No records found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrackingDetails();
  }, [trackingNumber]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!inputTracking.trim()) return;
    setTrackingNumber(inputTracking.trim());
  };

  const handleRescheduleSubmit = async () => {
    if (!rescheduleDate) {
      showToast('Please select a date and time.', 'warning');
      return;
    }
    setRescheduling(true);
    try {
      await shipmentService.reschedule(trackingNumber, rescheduleDate);
      showToast(`Shipment rescheduled successfully.`, 'success');
      setRescheduleOpen(false);
      setRescheduleDate('');
      fetchTrackingDetails();
    } catch (err) {
      showToast(err.response?.data?.message || 'Rescheduling failed', 'error');
    } finally {
      setRescheduling(false);
    }
  };

  // Amazon-style major milestone phases list
  const getMilestones = () => {
    if (!shipment) return [];

    // Helper: Find log matching status
    const findLog = (status) => timeline.find((t) => t.shipmentStatus === status);

    const createdLog = findLog('CREATED');
    const assignedLog = findLog('ASSIGNED');
    const pickedLog = findLog('PICKED_UP');
    const transitLog = findLog('IN_TRANSIT');
    const outLog = findLog('OUT_FOR_DELIVERY');
    const deliveredLog = findLog('DELIVERED');
    const failedLog = findLog('FAILED');

    // Ordered list of milestones
    const milestones = [
      {
        status: 'CREATED',
        label: 'Order Created',
        icon: <ReceiptIcon />,
        log: createdLog,
        description: createdLog?.remarks || 'Your shipping order has been registered in the system.',
      },
      {
        status: 'ASSIGNED',
        label: 'Agent Assigned',
        icon: <PersonIcon />,
        log: assignedLog,
        description: assignedLog?.remarks || 'Logistics executive allocated for pickup route.',
      },
      {
        status: 'PICKED_UP',
        label: 'Picked Up',
        icon: <LocalShippingIcon />,
        log: pickedLog,
        description: pickedLog?.remarks || 'Package retrieved and accepted at origin hub.',
      },
      {
        status: 'IN_TRANSIT',
        label: 'In Transit',
        icon: <FlightTakeoffIcon />,
        log: transitLog,
        description: transitLog?.remarks || 'Shipment sorting en route to destination facility.',
      },
      {
        status: 'OUT_FOR_DELIVERY',
        label: 'Out For Delivery',
        icon: <DirectionsBikeIcon />,
        log: outLog,
        description: outLog?.remarks || 'Package loaded for final doorstep dispatch route.',
      },
    ];

    // Handle terminal status (Delivered vs Failed vs Cancelled)
    if (shipment.shipmentStatus === 'FAILED' || failedLog) {
      milestones.push({
        status: 'FAILED',
        label: 'Delivery Failed',
        icon: <ErrorIcon />,
        log: failedLog || { eventTime: shipment.rescheduledDate || shipment.createdAt },
        description: failedLog?.remarks || 'Delivery attempt failed. Action required.',
        isError: true,
      });
    } else {
      milestones.push({
        status: 'DELIVERED',
        label: 'Delivered',
        icon: <CheckCircleIcon />,
        log: deliveredLog,
        description: deliveredLog?.remarks || 'Delivered successfully at target destination.',
      });
    }

    return milestones;
  };

  const milestones = getMilestones();

  // Find index of current status in milestones list
  const getCurrentMilestoneIndex = () => {
    if (!shipment) return -1;
    return milestones.findIndex((m) => m.status === shipment.shipmentStatus);
  };

  const currentIndex = getCurrentMilestoneIndex();

  return (
    <Box sx={{ maxWidth: 750, mx: 'auto', className: 'fade-in' }}>
      {/* Search Input Bar */}
      <Card sx={{ borderRadius: 4, mb: 4, boxShadow: '0 8px 24px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 2, color: '#1E293B' }}>
            Trace Cargo Shipment
          </Typography>
          <Box component="form" onSubmit={handleSearchSubmit} display="flex" gap={2}>
            <TextField
              required
              fullWidth
              label="Enter Tracking Number"
              value={inputTracking}
              onChange={(e) => setInputTracking(e.target.value)}
              placeholder="e.g. TRK-2026-00001"
            />
            <Button
              type="submit"
              variant="contained"
              sx={{ bgcolor: '#2563EB', '&:hover': { bgcolor: '#1D4ED8' }, px: 4, fontWeight: 700 }}
              startIcon={<SearchIcon />}
            >
              Trace
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Loading state */}
      {loading && <Loader message="Accessing platform tracking records..." />}

      {/* Error state */}
      {errorMsg && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
          {errorMsg}
        </Alert>
      )}

      {/* Shipment details and timeline */}
      {!loading && shipment && (
        <Box>
          {/* Main tracking banner */}
          <Paper
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 4,
              border: '1px solid #E2E8F0',
              bgcolor: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" fontWeight={500}>
                  TRACKING NUMBER
                </Typography>
                <Typography variant="h6" fontWeight={800} color="#1E293B">
                  {shipment.trackingNumber}
                </Typography>
              </Box>
              <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                <Typography variant="subtitle2" color="text.secondary" fontWeight={500}>
                  CURRENT STATUS
                </Typography>
                <Chip
                  label={shipment.shipmentStatus}
                  sx={{
                    bgcolor: shipment.shipmentStatus === 'FAILED' ? '#EF4444' : '#10B981',
                    color: '#ffffff',
                    fontWeight: 800,
                    mt: 0.5,
                  }}
                />
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">FROM</Typography>
                <Typography variant="body2" fontWeight={600}>{shipment.pickupAddress}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">TO</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {shipment.receiverName} ({shipment.receiverPhone})<br />
                  {shipment.deliveryAddress}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Failed Reschedule Button */}
          {shipment.shipmentStatus === 'FAILED' && (
            <Alert
              severity="warning"
              action={
                <Button
                  color="warning"
                  variant="contained"
                  size="small"
                  onClick={() => setRescheduleOpen(true)}
                  startIcon={<CalendarMonthIcon />}
                  sx={{ fontWeight: 700 }}
                >
                  Reschedule Shipment
                </Button>
              }
              sx={{ mb: 4, borderRadius: 3 }}
            >
              Delivery Attempt Failed. Please reschedule a new dispatch time slot.
            </Alert>
          )}

          {/* Vertical Amazon-style Timeline Progress */}
          <Paper sx={{ p: 4, borderRadius: 4, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
            <Typography variant="h6" fontWeight={800} color="#1E293B" sx={{ mb: 4 }}>
              Delivery Progress
            </Typography>

            <Box sx={{ position: 'relative', pl: 5 }}>
              {/* Vertical line connecting milestones */}
              <Box
                sx={{
                  position: 'absolute',
                  left: '21px',
                  top: '12px',
                  bottom: '24px',
                  width: '4px',
                  bgcolor: '#E2E8F0',
                  zIndex: 0,
                }}
              />

              {/* Milestones rendering */}
              {milestones.map((m, index) => {
                // Determine highlight levels
                const isPassed = index <= currentIndex;
                const isCurrent = index === currentIndex;
                const hasTimestamp = m.log !== undefined;

                // Color mappings
                let stepColor = '#CBD5E1'; // Muted grey for unreached
                if (isPassed) {
                  stepColor = m.isError ? '#EF4444' : '#10B981'; // Green for success milestones, Red for failure
                }

                return (
                  <Box key={m.status} sx={{ position: 'relative', mb: 4.5, display: 'flex', flexDirection: 'column' }}>
                    {/* Circle icon marker */}
                    <Box
                      sx={{
                        position: 'absolute',
                        left: '-46px',
                        top: '0px',
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        bgcolor: isPassed ? stepColor : '#FFFFFF',
                        border: '3px solid ' + (isPassed ? '#FFFFFF' : '#CBD5E1'),
                        color: isPassed ? '#FFFFFF' : '#94A3B8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: isPassed ? '0 0 0 2px ' + stepColor : 'none',
                        zIndex: 1,
                        transform: isCurrent ? 'scale(1.15)' : 'none',
                        animation: isCurrent ? 'pulse 2.5s infinite' : 'none',
                        '@keyframes pulse': {
                          '0%': { boxShadow: '0 0 0 0 rgba(16,185,129,0.5)' },
                          '70%': { boxShadow: '0 0 0 10px rgba(16,185,129,0)' },
                          '100%': { boxShadow: '0 0 0 0 rgba(16,185,129,0)' },
                        },
                      }}
                    >
                      {m.icon}
                    </Box>

                    {/* Milestone Details */}
                    <Box sx={{ pl: 1 }}>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Typography
                          variant="subtitle1"
                          fontWeight={isCurrent ? 800 : 600}
                          color={isCurrent ? (m.isError ? '#EF4444' : '#2563EB') : '#1E293B'}
                        >
                          {m.label}
                        </Typography>
                        {isCurrent && (
                          <Chip
                            label="LATEST UPDATE"
                            size="small"
                            sx={{
                              bgcolor: m.isError ? '#FEF2F2' : '#EFF6FF',
                              color: m.isError ? '#EF4444' : '#2563EB',
                              fontWeight: 800,
                              height: 18,
                              fontSize: '0.65rem',
                              border: '1px solid ' + (m.isError ? '#FCA5A5' : '#BFDBFE'),
                            }}
                          />
                        )}
                      </Box>

                      {hasTimestamp && m.log.eventTime && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                          {formatDate(m.log.eventTime)}
                        </Typography>
                      )}

                      <Typography
                        variant="body2"
                        color={isPassed ? 'text.primary' : 'text.secondary'}
                        sx={{ mt: 0.75, fontStyle: isPassed ? 'normal' : 'italic' }}
                      >
                        {isPassed ? m.description : 'Pending next cargo transit gate.'}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Paper>
        </Box>
      )}

      {/* Rescheduling Dialog */}
      <Dialog open={rescheduleOpen} onClose={() => setRescheduleOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Reschedule Shipment Delivery</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Provide a new dispatch date and time slot for booking re-delivery:
          </Typography>
          <TextField
            required
            fullWidth
            type="datetime-local"
            value={rescheduleDate}
            onChange={(e) => setRescheduleDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setRescheduleOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleRescheduleSubmit}
            variant="contained"
            disabled={rescheduling}
            sx={{ bgcolor: '#F59E0B', '&:hover': { bgcolor: '#D97706' }, fontWeight: 700 }}
          >
            {rescheduling ? 'Booking...' : 'Reschedule'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomerTrack;
