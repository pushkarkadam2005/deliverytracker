import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  IconButton,
  TablePagination,
  TextField,
  MenuItem,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import { shipmentService } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { formatCurrency, formatDate, formatWeight } from '../../utils/format';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import Loader from '../../components/Loader';

const CustomerShipments = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Shipments List State
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  // Search & Filter State
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Cancellation State
  const [cancelOpen, setCancelOpen] = useState(false);
  const [selectedTracking, setSelectedTracking] = useState('');

  // Rescheduling State
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');

  const fetchShipments = async () => {
    setLoading(true);
    try {
      // Fetch all to support client-side filtering or page items
      // Since backend getMyShipments is paginated, we fetch it
      const data = await shipmentService.getMyShipments(page, rowsPerPage);
      let list = data.content || [];

      // If search text or filter status is applied, we can filter client-side or prompt the user.
      // Let's filter client-side for seamless UX
      if (searchText.trim()) {
        list = list.filter(
          (s) =>
            s.trackingNumber.toLowerCase().includes(searchText.toLowerCase()) ||
            (s.receiverName && s.receiverName.toLowerCase().includes(searchText.toLowerCase()))
        );
      }

      if (statusFilter) {
        list = list.filter((s) => s.shipmentStatus === statusFilter);
      }

      setShipments(list);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      showToast('Failed to load shipments list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, [page, rowsPerPage, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchShipments();
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Status Badge Mapper
  const getStatusChip = (status) => {
    let color = 'default';
    switch (status) {
      case 'CREATED':
        color = 'primary';
        break;
      case 'ASSIGNED':
        color = 'info';
        break;
      case 'PICKED_UP':
      case 'IN_TRANSIT':
      case 'OUT_FOR_DELIVERY':
        color = 'warning';
        break;
      case 'DELIVERED':
        color = 'success';
        break;
      case 'FAILED':
      case 'CANCELLED':
        color = 'error';
        break;
    }
    return <Chip label={status} color={color} size="small" sx={{ fontWeight: 700 }} />;
  };

  // Cancellation Actions
  const handleCancelClick = (trackingNumber) => {
    setSelectedTracking(trackingNumber);
    setCancelOpen(true);
  };

  const handleCancelConfirm = async () => {
    try {
      await shipmentService.cancel(selectedTracking);
      showToast(`Shipment ${selectedTracking} has been successfully cancelled.`, 'success');
      fetchShipments();
    } catch (err) {
      showToast(err.response?.data?.message || 'Cancellation failed', 'error');
    } finally {
      setCancelOpen(false);
      setSelectedTracking('');
    }
  };

  // Rescheduling Actions
  const handleRescheduleClick = (trackingNumber) => {
    setSelectedTracking(trackingNumber);
    setRescheduleOpen(true);
  };

  const handleRescheduleSubmit = async () => {
    if (!rescheduleDate) {
      showToast('Please select a date and time.', 'warning');
      return;
    }
    try {
      await shipmentService.reschedule(selectedTracking, rescheduleDate);
      showToast(`Shipment ${selectedTracking} rescheduled successfully.`, 'success');
      fetchShipments();
    } catch (err) {
      showToast(err.response?.data?.message || 'Rescheduling failed', 'error');
    } finally {
      setRescheduleOpen(false);
      setSelectedTracking('');
      setRescheduleDate('');
    }
  };

  return (
    <Card sx={{ borderRadius: 4, boxShadow: '0 8px 24px rgba(0,0,0,0.06)', className: 'fade-in' }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h5" fontWeight={800} color="#1E293B">
            My Shipments
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/customer/create-shipment')}
            sx={{ bgcolor: '#2563EB', '&:hover': { bgcolor: '#1D4ED8' }, fontWeight: 700 }}
          >
            Book Shipment
          </Button>
        </Box>

        {/* Search and Status Filters */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Box component="form" onSubmit={handleSearchSubmit} display="flex" gap={1}>
              <TextField
                fullWidth
                label="Search Tracking ID or Receiver"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="e.g. DLT-2026..."
              />
              <Button type="submit" variant="outlined" sx={{ minWidth: 54 }}>
                <SearchIcon />
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              fullWidth
              label="Filter Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="CREATED">CREATED</MenuItem>
              <MenuItem value="ASSIGNED">ASSIGNED</MenuItem>
              <MenuItem value="PICKED_UP">PICKED_UP</MenuItem>
              <MenuItem value="IN_TRANSIT">IN_TRANSIT</MenuItem>
              <MenuItem value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</MenuItem>
              <MenuItem value="DELIVERED">DELIVERED</MenuItem>
              <MenuItem value="FAILED">FAILED (Failed Delivery)</MenuItem>
              <MenuItem value="CANCELLED">CANCELLED</MenuItem>
            </TextField>
          </Grid>
        </Grid>

        {loading ? (
          <Loader message="Accessing shipment ledger..." />
        ) : (
          <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #E2E8F0', borderRadius: 3 }}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Tracking ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Receiver</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Billable Weight</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Order Type</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Booked On</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {shipments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">No shipments matched your search criteria.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  shipments.map((row) => (
                    <TableRow key={row.trackingNumber} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell fontWeight={600} color="#1E3A8A">{row.trackingNumber}</TableCell>
                      <TableCell>{row.receiverName}</TableCell>
                      <TableCell>{getStatusChip(row.shipmentStatus)}</TableCell>
                      <TableCell>{formatWeight(row.billableWeight)}</TableCell>
                      <TableCell>{row.orderType}</TableCell>
                      <TableCell>{formatDate(row.createdAt)}</TableCell>
                      <TableCell align="center">
                        <Box display="flex" justifyContent="center" gap={1}>
                          <IconButton
                            color="primary"
                            size="small"
                            title="View Details"
                            onClick={() => navigate(`/customer/shipments/${row.trackingNumber}`)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                          {(row.shipmentStatus === 'CREATED' || row.shipmentStatus === 'ASSIGNED') && (
                            <IconButton
                              color="error"
                              size="small"
                              title="Cancel Order"
                              onClick={() => handleCancelClick(row.trackingNumber)}
                            >
                              <CancelIcon />
                            </IconButton>
                          )}
                          {row.shipmentStatus === 'FAILED' && (
                            <IconButton
                              color="warning"
                              size="small"
                              title="Reschedule Delivery"
                              onClick={() => handleRescheduleClick(row.trackingNumber)}
                            >
                              <CalendarMonthIcon />
                            </IconButton>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <TablePagination
          rowsPerPageOptions={[5, 10, 20]}
          component="div"
          count={totalElements}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />

        {/* Cancellation Confirmation */}
        <ConfirmationDialog
          open={cancelOpen}
          title="Cancel Shipping Order?"
          message={`Are you sure you want to cancel shipment ${selectedTracking}? This order will be terminated immediately.`}
          confirmText="Yes, Cancel"
          onConfirm={handleCancelConfirm}
          onCancel={() => setCancelOpen(false)}
          severity="error"
        />

        {/* Rescheduling Dialog */}
        <Dialog open={rescheduleOpen} onClose={() => setRescheduleOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Reschedule Delivery</DialogTitle>
          <DialogContent sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Select a new date and time for agent dispatch.
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
              sx={{ bgcolor: '#F59E0B', '&:hover': { bgcolor: '#D97706' }, fontWeight: 700 }}
            >
              Reschedule
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default CustomerShipments;
