import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Divider,
  Button,
  Chip,
  Paper,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MapIcon from '@mui/icons-material/Map';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import PaymentsIcon from '@mui/icons-material/Payments';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { shipmentService, trackingService } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { formatDate, formatWeight, formatCurrency } from '../../utils/format';
import Loader from '../../components/Loader';
import { getStatusColor } from '../admin/AdminShipments';

const ShipmentDetails = () => {
  const { trackingNumber } = useParams();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [shipment, setShipment] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Rescheduling Dialog State
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduling, setRescheduling] = useState(false);

  const fetchDetails = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const shipData = await shipmentService.getByTracking(trackingNumber);
      const timelineData = await trackingService.getTimeline(trackingNumber);
      setShipment(shipData);
      setTimeline(timelineData.history || []);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Could not retrieve shipment details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [trackingNumber]);

  const handleRescheduleSubmit = async () => {
    if (!rescheduleDate) {
      showToast('Please select a date and time.', 'warning');
      return;
    }
    setRescheduling(true);
    try {
      await shipmentService.reschedule(trackingNumber, rescheduleDate);
      showToast(`Shipment ${trackingNumber} rescheduled successfully.`, 'success');
      setRescheduleOpen(false);
      setRescheduleDate('');
      fetchDetails();
    } catch (err) {
      showToast(err.response?.data?.message || 'Rescheduling failed', 'error');
    } finally {
      setRescheduling(false);
    }
  };

  if (loading) {
    return <Loader message="Accessing shipment ledger data..." />;
  }

  if (errorMsg) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
        <Alert severity="error" sx={{ borderRadius: 3, mb: 3 }}>
          {errorMsg}
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/customer/shipments')}>
          Back to Shipments
        </Button>
      </Box>
    );
  }

  if (!shipment) return null;

  // Augmenting charges if not present on mock placeholder
  const baseCharge = shipment.deliveryCharge?.baseCharge || 150.00;
  const overweightCharge = shipment.deliveryCharge?.overweightCharge || 50.00;
  const totalCharge = shipment.deliveryCharge?.totalCharge || 200.00;

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', className: 'fade-in' }}>
      {/* Navigation Header */}
      <Box display="flex" alignItems="center" gap={1.5} sx={{ mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/customer/shipments')} sx={{ fontWeight: 700 }}>
          Back to Shipments
        </Button>
        <Typography variant="h6" fontWeight={800} color="#1E293B">
          Shipment Details: {shipment.trackingNumber}
        </Typography>
      </Box>

      {/* Main Grid Details */}
      <Grid container spacing={4}>
        {/* Left Column: Shipment Specs */}
        <Grid item xs={12} md={7}>
          {/* Status Alert for Failed Deliveries */}
          {shipment.shipmentStatus === 'FAILED' && (
            <Alert
              severity="warning"
              action={
                <Button
                  color="warning"
                  size="small"
                  variant="contained"
                  onClick={() => setRescheduleOpen(true)}
                  startIcon={<CalendarMonthIcon />}
                  sx={{ fontWeight: 700 }}
                >
                  Reschedule Delivery
                </Button>
              }
              sx={{ mb: 3, borderRadius: 3 }}
            >
              Delivery Attempt Failed. Please reschedule a new pickup dispatch time.
            </Alert>
          )}

          <Card sx={{ borderRadius: 4, mb: 3, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={800} color="#2563EB" sx={{ mb: 2 }}>
                Shipment Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2.5}>
                {/* Pickup Address */}
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    PICKUP ORIGIN ADDRESS
                  </Typography>
                  <Typography variant="body2" fontWeight={600} color="#1E293B">
                    {shipment.pickupAddress} (Pin code: {shipment.pickupPincode})
                  </Typography>
                </Grid>

                {/* Drop Address */}
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    DROP DESTINATION ADDRESS
                  </Typography>
                  <Typography variant="body2" fontWeight={600} color="#1E293B">
                    {shipment.receiverName} ({shipment.receiverPhone})<br />
                    {shipment.deliveryAddress} (Pin code: {shipment.deliveryPincode})
                  </Typography>
                </Grid>

                {/* Weight details */}
                <Grid item xs={6} sm={4}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    ACTUAL WEIGHT
                  </Typography>
                  <Typography variant="body2" fontWeight={600} color="#1E293B">
                    {formatWeight(shipment.actualWeight)}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    BILLABLE WEIGHT
                  </Typography>
                  <Typography variant="body2" fontWeight={600} color="#1E293B">
                    {formatWeight(shipment.billableWeight)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    ORDER TYPE
                  </Typography>
                  <Typography variant="body2" fontWeight={600} color="#1E293B">
                    {shipment.orderType}
                  </Typography>
                </Grid>

                {/* Payment & Status */}
                <Grid item xs={6} sm={4}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    PAYMENT TYPE
                  </Typography>
                  <Typography variant="body2" fontWeight={600} color="#1E293B">
                    {shipment.paymentType}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={8}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    STATUS
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={shipment.shipmentStatus}
                      sx={{
                        bgcolor: getStatusColor(shipment.shipmentStatus),
                        color: '#ffffff',
                        fontWeight: 700,
                      }}
                      size="small"
                    />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Delivery Charges card */}
          <Card sx={{ borderRadius: 4, mb: 3, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={800} color="#2563EB" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PaymentsIcon /> Delivery Charge Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Base Rate Charge:</Typography>
                <Typography variant="body2" fontWeight={600}>{formatCurrency(baseCharge)}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Overage Excess Weight Charge:</Typography>
                <Typography variant="body2" fontWeight={600}>{formatCurrency(overweightCharge)}</Typography>
              </Box>
              <Divider sx={{ my: 1.5 }} />
              <Box display="flex" justifyContent="space-between">
                <Typography variant="subtitle2" fontWeight={700}>Total Delivery Fee:</Typography>
                <Typography variant="subtitle2" fontWeight={800} color="#2563EB">{formatCurrency(totalCharge)}</Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Agent details */}
          <Card sx={{ borderRadius: 4, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={800} color="#2563EB" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon /> Assigned Delivery Agent
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {shipment.agentDetails ? (
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">NAME</Typography>
                    <Typography variant="body2" fontWeight={600}>{shipment.agentDetails.name}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">PHONE</Typography>
                    <Typography variant="body2" fontWeight={600}>{shipment.agentDetails.phone}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">VEHICLE LICENSE</Typography>
                    <Typography variant="body2" fontWeight={600}>{shipment.agentDetails.vehicle}</Typography>
                  </Grid>
                </Grid>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  No delivery agent has been assigned to this route yet.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column: Tracking timeline check points */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
            <Typography variant="subtitle1" fontWeight={800} color="#1E293B" sx={{ mb: 3 }}>
              Shipment Tracking Timeline
            </Typography>

            <Box sx={{ position: 'relative', pl: 3, borderLeft: '2px solid #E2E8F0', ml: 1 }}>
              {timeline.length === 0 ? (
                <Typography color="text.secondary" variant="body2">No logs recorded.</Typography>
              ) : (
                timeline.map((log, index) => (
                  <Box key={log.id || index} sx={{ position: 'relative', mb: 3 }}>
                    <Box
                      sx={{
                        position: 'absolute',
                        left: '-26px',
                        top: '4px',
                        width: '10px',
                        height: '10px',
                        bgcolor: getStatusColor(log.shipmentStatus),
                        borderRadius: '50%',
                      }}
                    />
                    <Typography variant="subtitle2" color={getStatusColor(log.shipmentStatus)} fontWeight={700}>
                      {log.shipmentStatus}
                    </Typography>
                    <Typography variant="body2" color="#334155" sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <MapIcon sx={{ fontSize: 13, color: '#64748B' }} /> {log.location}
                    </Typography>
                    {log.remarks && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontStyle: 'italic' }}>
                        "{log.remarks}"
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                      {formatDate(log.eventTime)}
                    </Typography>
                  </Box>
                ))
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

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

export default ShipmentDetails;
