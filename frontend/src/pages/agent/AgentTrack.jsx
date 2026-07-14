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
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import EditLocationIcon from '@mui/icons-material/EditLocation';
import UpdateIcon from '@mui/icons-material/Update';
import MapIcon from '@mui/icons-material/Map';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SearchIcon from '@mui/icons-material/Search';
import { shipmentService, trackingService } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { formatDate, formatWeight } from '../../utils/format';
import Loader from '../../components/Loader';

const AgentTrack = () => {
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [inputTracking, setInputTracking] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shipment, setShipment] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Update Status Form State
  const [newStatus, setNewStatus] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');
  const [remarks, setRemarks] = useState('');

  // Extract tracking parameter from query
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const trk = params.get('tracking');
    if (trk) {
      setTrackingNumber(trk);
      setInputTracking(trk);
    }
  }, [location]);

  // Fetch details when trackingNumber changes
  const fetchDetails = async () => {
    if (!trackingNumber) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const shipData = await shipmentService.getByTracking(trackingNumber);
      const timelineData = await trackingService.getTimeline(trackingNumber);
      setShipment(shipData);
      setTimeline(timelineData.history || []);
      
      // Auto-populate location based on destination area if empty
      setCurrentLocation((shipData.pickupArea?.areaName) || '');
    } catch (err) {
      console.error(err);
      setShipment(null);
      setTimeline([]);
      setErrorMsg('Shipment not found. Please verify the tracking number.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [trackingNumber]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!inputTracking.trim()) return;
    setTrackingNumber(inputTracking.trim());
    navigate(`/agent/track?tracking=${inputTracking.trim()}`, { replace: true });
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!newStatus || !currentLocation || !remarks) {
      showToast('Please fill out all status update inputs.', 'warning');
      return;
    }

    setUpdating(true);
    try {
      const payload = {
        shipmentStatus: newStatus,
        location: currentLocation,
        remarks: remarks,
      };
      await trackingService.updateStatus(trackingNumber, payload);
      showToast(`Shipment ${trackingNumber} status updated to ${newStatus}.`, 'success');
      
      // Reset status form and refresh shipment details
      setNewStatus('');
      setRemarks('');
      fetchDetails();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to update tracking status', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CREATED': return '#3B82F6';
      case 'ASSIGNED': return '#06B6D4';
      case 'PICKED_UP': return '#F59E0B';
      case 'IN_TRANSIT': return '#D97706';
      case 'OUT_FOR_DELIVERY': return '#8B5CF6';
      case 'DELIVERED': return '#10B981';
      case 'FAILED':
      case 'CANCELLED': return '#EF4444';
      default: return '#64748B';
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      {/* Search Input Card */}
      <Card sx={{ borderRadius: 4, mb: 4, boxShadow: '0 8px 24px rgba(0,0,0,0.05)' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: '#1E293B' }}>
            Select Active Assigned Package
          </Typography>
          <Box component="form" onSubmit={handleSearchSubmit} display="flex" gap={2}>
            <TextField
              fullWidth
              label="Enter/Scan Tracking ID (e.g. DLT-2026-X)"
              value={inputTracking}
              onChange={(e) => setInputTracking(e.target.value)}
              placeholder="DLT-2026-X"
            />
            <Button
              type="submit"
              variant="contained"
              sx={{ bgcolor: '#2563EB', '&:hover': { bgcolor: '#1D4ED8' }, px: 4, fontWeight: 700 }}
              startIcon={<SearchIcon />}
            >
              Search
            </Button>
          </Box>
        </CardContent>
      </Card>

      {loading && <Loader message="Accessing transit log ledger..." />}

      {errorMsg && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
          {errorMsg}
        </Alert>
      )}

      {!loading && shipment && (
        <Grid container spacing={3}>
          {/* Details Card */}
          <Grid item xs={12} md={7}>
            <Card sx={{ borderRadius: 4, mb: 3, boxShadow: '0 8px 24px rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight={800} color="#1E293B">
                    Shipment ID: {shipment.trackingNumber}
                  </Typography>
                  <Chip
                    label={shipment.shipmentStatus}
                    sx={{
                      bgcolor: getStatusColor(shipment.shipmentStatus),
                      color: '#ffffff',
                      fontWeight: 700,
                    }}
                  />
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">PICKUP ADDRESS</Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
                      {shipment.pickupAddress} (ZIP: {shipment.pickupPincode})
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">DELIVERY ADDRESS</Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
                      {shipment.receiverName} ({shipment.receiverPhone})<br />
                      {shipment.deliveryAddress} (ZIP: {shipment.deliveryPincode})
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">WEIGHT</Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
                      {formatWeight(shipment.billableWeight)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">COD CHARGES</Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }} color={shipment.paymentType === 'COD' ? '#D97706' : 'inherit'}>
                      {shipment.paymentType}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Timeline checkpoints */}
            <Typography variant="h6" fontWeight={800} color="#1E293B" sx={{ mb: 2, px: 1 }}>
              Timeline History Log
            </Typography>
            
            <Box sx={{ position: 'relative', pl: 4, '&::before': {
              content: '""',
              position: 'absolute',
              left: '15px',
              top: '8px',
              bottom: '8px',
              width: '2px',
              bgcolor: '#E2E8F0',
              zIndex: 0,
            }}}>
              {timeline.map((log, index) => {
                const isLatest = index === timeline.length - 1;
                return (
                  <Box key={log.id || index} sx={{ position: 'relative', mb: 3 }}>
                    <Box
                      sx={{
                        position: 'absolute',
                        left: '-32px',
                        top: '4px',
                        width: '18px',
                        height: '18px',
                        bgcolor: getStatusColor(log.shipmentStatus),
                        borderRadius: '50%',
                        border: '4px solid #ffffff',
                        boxShadow: '0 0 0 2px ' + getStatusColor(log.shipmentStatus),
                        zIndex: 1,
                      }}
                    />
                    <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: isLatest ? '#FFFFFF' : '#FAFAFA' }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle2" fontWeight={700} color={getStatusColor(log.shipmentStatus)}>
                          {log.shipmentStatus}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={0.5} sx={{ color: 'text.secondary' }}>
                          <AccessTimeIcon sx={{ fontSize: 13 }} />
                          <Typography variant="caption">{formatDate(log.eventTime)}</Typography>
                        </Box>
                      </Box>
                      <Box display="flex" alignItems="center" gap={0.5} sx={{ mt: 0.5, color: 'text.secondary' }}>
                        <MapIcon sx={{ fontSize: 13 }} />
                        <Typography variant="body2" fontWeight={500}>{log.location}</Typography>
                      </Box>
                      {log.remarks && (
                        <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic', color: 'text.secondary' }}>
                          "{log.remarks}"
                        </Typography>
                      )}
                    </Paper>
                  </Box>
                );
              })}
            </Box>
          </Grid>

          {/* Status Update Form */}
          <Grid item xs={12} md={5}>
            {shipment.shipmentStatus === 'DELIVERED' || shipment.shipmentStatus === 'CANCELLED' ? (
              <Alert severity="info" sx={{ borderRadius: 3 }}>
                This shipment is in terminal status [<strong>{shipment.shipmentStatus}</strong>] and cannot be updated further.
              </Alert>
            ) : (
              <Card sx={{ borderRadius: 4, position: 'sticky', top: 90, boxShadow: '0 8px 24px rgba(0,0,0,0.05)' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={800} color="#1E293B" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EditLocationIcon sx={{ color: '#2563EB' }} /> Log Milestone Update
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  <Box component="form" onSubmit={handleUpdateStatus}>
                    <FormControl fullWidth sx={{ mb: 2.5 }}>
                      <InputLabel id="status-select-label">Select Transition Status</InputLabel>
                      <Select
                        labelId="status-select-label"
                        label="Select Transition Status"
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        required
                      >
                        <MenuItem value="PICKED_UP">PICKED_UP (Arrived at Origin Hub)</MenuItem>
                        <MenuItem value="IN_TRANSIT">IN_TRANSIT (Departed Hub)</MenuItem>
                        <MenuItem value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY (Out for Delivery)</MenuItem>
                        <MenuItem value="DELIVERED">DELIVERED (Successfully Handed Over)</MenuItem>
                        <MenuItem value="FAILED">FAILED (Delivery Attempt Failed)</MenuItem>
                      </Select>
                    </FormControl>

                    <TextField
                      fullWidth
                      required
                      label="Current Location City/Hub"
                      value={currentLocation}
                      onChange={(e) => setCurrentLocation(e.target.value)}
                      placeholder="e.g. New Delhi Okhla Hub"
                      sx={{ mb: 2.5 }}
                    />

                    <TextField
                      fullWidth
                      required
                      multiline
                      rows={3}
                      label="Checkpoint Status Remarks"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="e.g. Shipment received at hub, sorted and ready for transit"
                      sx={{ mb: 3 }}
                    />

                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      disabled={updating}
                      startIcon={<UpdateIcon />}
                      sx={{
                        bgcolor: '#2563EB',
                        '&:hover': { bgcolor: '#1D4ED8' },
                        fontWeight: 700,
                        py: 1.5,
                        borderRadius: 2,
                      }}
                    >
                      {updating ? 'Recording checkpoint...' : 'Save Checkpoint'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default AgentTrack;
