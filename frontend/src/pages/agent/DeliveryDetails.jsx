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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MapIcon from '@mui/icons-material/Map';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { shipmentService, trackingService } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { formatDate, formatWeight } from '../../utils/format';
import Loader from '../../components/Loader';
import { getStatusColor } from '../admin/AdminShipments';

const DeliveryDetails = () => {
  const { trackingNumber } = useParams();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [shipment, setShipment] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Status Update Dialog State
  const [updateOpen, setUpdateOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState('');
  const [locationHub, setLocationHub] = useState('');
  const [remarks, setRemarks] = useState('');
  const [updating, setUpdating] = useState(false);

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

  const handleStatusClick = (status) => {
    setTargetStatus(status);
    // Pre-fill location or remarks based on status
    if (status === 'PICKED_UP') {
      setLocationHub('Origin Hub');
      setRemarks('Cargo package picked up from consignor.');
    } else if (status === 'IN_TRANSIT') {
      setLocationHub('Sorting Facility');
      setRemarks('Cargo in transit between distribution hubs.');
    } else if (status === 'OUT_FOR_DELIVERY') {
      setLocationHub('Local Delivery Hub');
      setRemarks('Package loaded and out for delivery dispatch.');
    } else if (status === 'DELIVERED') {
      setLocationHub('Customer Doorstep');
      setRemarks('Delivered successfully to receiver.');
    } else if (status === 'FAILED') {
      setLocationHub('Delivery Route');
      setRemarks('Attempt failed. Receiver unavailable.');
    }
    setUpdateOpen(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!locationHub.trim() || !remarks.trim()) {
      showToast('Please enter location and status remarks.', 'warning');
      return;
    }

    setUpdating(true);
    try {
      await trackingService.updateStatus(trackingNumber, {
        shipmentStatus: targetStatus,
        location: locationHub,
        remarks: remarks,
      });
      showToast(`Status updated to ${targetStatus} successfully.`, 'success');
      setUpdateOpen(false);
      fetchDetails();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to post milestone update.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <Loader message="Accessing active assigned route details..." />;
  }

  if (errorMsg) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
        <Alert severity="error" sx={{ borderRadius: 3, mb: 3 }}>
          {errorMsg}
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/agent/dashboard')}>
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  if (!shipment) return null;

  // Check if status is terminal
  const isTerminal = shipment.shipmentStatus === 'DELIVERED' || shipment.shipmentStatus === 'CANCELLED';

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', className: 'fade-in' }}>
      {/* Navigation Header */}
      <Box display="flex" alignItems="center" gap={1.5} sx={{ mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/agent/dashboard')} sx={{ fontWeight: 700 }}>
          Back to Dashboard
        </Button>
        <Typography variant="h6" fontWeight={800} color="#1E293B">
          Delivery Task: {shipment.trackingNumber}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column: Shipment specs & Quick update console */}
        <Grid item xs={12} md={7}>
          {/* Milestone Update Console */}
          <Card sx={{ borderRadius: 4, mb: 3, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={800} color="#2563EB" sx={{ mb: 2 }}>
                Update Shipment Milestone
              </Typography>
              <Divider sx={{ mb: 2.5 }} />

              {isTerminal ? (
                <Alert severity="info" sx={{ borderRadius: 3 }}>
                  This shipment is in the terminal status <strong>{shipment.shipmentStatus}</strong>. No further status changes can be made.
                </Alert>
              ) : (
                <Box display="flex" flexDirection="column" gap={2}>
                  <Typography variant="body2" color="text.secondary">
                    Provide milestone logs for the package. Current state: <strong>{shipment.shipmentStatus}</strong>
                  </Typography>

                  <Box display="flex" flexWrap="wrap" gap={1.5}>
                    {shipment.shipmentStatus === 'ASSIGNED' && (
                      <Button
                        variant="contained"
                        onClick={() => handleStatusClick('PICKED_UP')}
                        sx={{ bgcolor: '#3B82F6', fontWeight: 700 }}
                      >
                        Picked Up
                      </Button>
                    )}

                    {shipment.shipmentStatus === 'PICKED_UP' && (
                      <Button
                        variant="contained"
                        onClick={() => handleStatusClick('IN_TRANSIT')}
                        sx={{ bgcolor: '#F59E0B', fontWeight: 700 }}
                      >
                        In Transit
                      </Button>
                    )}

                    {shipment.shipmentStatus === 'IN_TRANSIT' && (
                      <Button
                        variant="contained"
                        onClick={() => handleStatusClick('OUT_FOR_DELIVERY')}
                        sx={{ bgcolor: '#8B5CF6', fontWeight: 700 }}
                      >
                        Out For Delivery
                      </Button>
                    )}

                    {shipment.shipmentStatus === 'OUT_FOR_DELIVERY' && (
                      <>
                        <Button
                          variant="contained"
                          onClick={() => handleStatusClick('DELIVERED')}
                          sx={{ bgcolor: '#10B981', fontWeight: 700 }}
                        >
                          Delivered
                        </Button>
                        <Button
                          variant="contained"
                          onClick={() => handleStatusClick('FAILED')}
                          sx={{ bgcolor: '#EF4444', fontWeight: 700 }}
                        >
                          Failed
                        </Button>
                      </>
                    )}
                    
                    {/* Fallback buttons in case of status skips */}
                    {shipment.shipmentStatus !== 'ASSIGNED' && shipment.shipmentStatus !== 'OUT_FOR_DELIVERY' && (
                      <Button
                        variant="outlined"
                        onClick={() => handleStatusClick('OUT_FOR_DELIVERY')}
                        sx={{ fontWeight: 700 }}
                      >
                        Out For Delivery
                      </Button>
                    )}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Details Card */}
          <Card sx={{ borderRadius: 4, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={800} color="#1E293B" sx={{ mb: 2 }}>
                Shipment Route Specs
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2.5}>
                {/* Pickup */}
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    PICKUP ORIGIN
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {shipment.pickupAddress} (Pincode: {shipment.pickupPincode})
                  </Typography>
                </Grid>

                {/* Drop */}
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    DROP TARGET (CONSIGNEE)
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {shipment.receiverName} ({shipment.receiverPhone})<br />
                    {shipment.deliveryAddress} (Pincode: {shipment.deliveryPincode})
                  </Typography>
                  <Box display="flex" gap={1} sx={{ mt: 1 }}>
                    <Button
                      startIcon={<PhoneIcon />}
                      size="small"
                      variant="outlined"
                      href={`tel:${shipment.receiverPhone}`}
                      sx={{ borderRadius: 2 }}
                    >
                      Call Customer
                    </Button>
                  </Box>
                </Grid>

                <Grid item xs={6} sm={4}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    BILLABLE WEIGHT
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {formatWeight(shipment.billableWeight)}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    ORDER TYPE
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {shipment.orderType}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    PAYMENT TERMS
                  </Typography>
                  <Typography variant="body2" fontWeight={600} color="#2563EB">
                    {shipment.paymentType}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column: Tracking timeline check points */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
            <Typography variant="subtitle1" fontWeight={800} color="#1E293B" sx={{ mb: 3 }}>
              Tracking Milestones Timeline
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
                      <LocationOnIcon sx={{ fontSize: 13, color: '#64748B' }} /> {log.location}
                    </Typography>
                    {log.remarks && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontStyle: 'italic' }}>
                        "{log.remarks}"
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                      {formatDate(log.eventTime)} (by {log.actor})
                    </Typography>
                  </Box>
                ))
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Milestone status update dialog */}
      <Dialog open={updateOpen} onClose={() => setUpdateOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Update Delivery Status: {targetStatus}</DialogTitle>
        <form onSubmit={handleUpdateSubmit}>
          <DialogContent sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              required
              fullWidth
              label="Current Location Hub"
              value={locationHub}
              onChange={(e) => setLocationHub(e.target.value)}
              placeholder="e.g. Okhla Hub, Delhi"
            />
            <TextField
              required
              fullWidth
              multiline
              rows={3}
              label="Milestone Remarks / Comments"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Package loaded successfully onto transport vehicle."
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setUpdateOpen(false)} color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={updating} sx={{ fontWeight: 700 }}>
              {updating ? 'Submitting...' : 'Post Milestone'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default DeliveryDetails;
