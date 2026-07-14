import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  IconButton,
  TextField,
  MenuItem,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import { adminService, shipmentService, trackingService } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { formatCurrency, formatDate } from '../../utils/format';
import Loader from '../../components/Loader';

const AdminShipments = () => {
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();

  // Shipments List State
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination & Grid Parameters
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [totalElements, setTotalElements] = useState(0);

  // Filters State
  const [filterStatus, setFilterStatus] = useState('');
  const [filterZone, setFilterZone] = useState('');
  const [filterAgentId, setFilterAgentId] = useState('');
  const [searchText, setSearchText] = useState(searchParams.get('search') || '');

  // Agents list for assignment dropdown
  const [agents, setAgents] = useState([]);

  // Assignment Dialog State
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedTracking, setSelectedTracking] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('');

  // Status Override Dialog State
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [overrideStatus, setOverrideStatus] = useState('');

  // Details Drawer/Dialog State
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [shipmentDetails, setShipmentDetails] = useState(null);
  const [shipmentTimeline, setShipmentTimeline] = useState([]);

  const fetchShipments = async () => {
    setLoading(true);
    try {
      const params = {
        page: paginationModel.page,
        size: paginationModel.pageSize,
        ...(filterStatus && { status: filterStatus }),
        ...(filterZone && { zone: filterZone }),
        ...(filterAgentId && { agentId: filterAgentId }),
      };

      const data = await adminService.getShipments(params);
      let list = data.content || [];
      
      // Perform client side text filtering if search text is typed
      if (searchText.trim()) {
        list = list.filter((s) =>
          s.trackingNumber.toLowerCase().includes(searchText.toLowerCase()) ||
          (s.receiverName && s.receiverName.toLowerCase().includes(searchText.toLowerCase()))
        );
      }

      // x-data-grid requires unique 'id' field, map trackingNumber to id
      const formattedList = list.map((s, idx) => ({
        ...s,
        id: s.trackingNumber || idx,
      }));

      setShipments(formattedList);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      showToast('Error loading shipments listing', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const data = await adminService.getAgents(0, 100);
      setAgents(data.content || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, [paginationModel.page, paginationModel.pageSize, filterStatus, filterZone, filterAgentId]);

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchShipments();
  };

  // Action Triggers
  const handleAssignClick = (trackingNumber) => {
    setSelectedTracking(trackingNumber);
    setAssignOpen(true);
  };

  const handleAssignSubmit = async () => {
    if (!selectedAgent) {
      showToast('Please select a delivery agent.', 'warning');
      return;
    }
    try {
      await adminService.manualAssignAgent(selectedTracking, selectedAgent);
      showToast(`Agent assigned to ${selectedTracking} successfully.`, 'success');
      fetchShipments();
    } catch (err) {
      showToast(err.response?.data?.message || 'Assignment override failed', 'error');
    } finally {
      setAssignOpen(false);
      setSelectedTracking('');
      setSelectedAgent('');
    }
  };

  const handleOverrideClick = (trackingNumber, currentStatus) => {
    setSelectedTracking(trackingNumber);
    setOverrideStatus(currentStatus);
    setOverrideOpen(true);
  };

  const handleOverrideSubmit = async () => {
    try {
      await adminService.overrideStatus(selectedTracking, overrideStatus);
      showToast(`Shipment ${selectedTracking} status overridden to ${overrideStatus}.`, 'success');
      fetchShipments();
    } catch (err) {
      showToast(err.response?.data?.message || 'Status override failed', 'error');
    } finally {
      setOverrideOpen(false);
      setSelectedTracking('');
      setOverrideStatus('');
    }
  };

  const handleViewDetails = async (trackingNumber) => {
    try {
      const shipDetails = await shipmentService.getByTracking(trackingNumber);
      const timelineData = await trackingService.getTimeline(trackingNumber);
      setShipmentDetails(shipDetails);
      setShipmentTimeline(timelineData.history || []);
      setDetailsOpen(true);
    } catch (err) {
      showToast('Could not load details for shipment ' + trackingNumber, 'error');
    }
  };

  // DataGrid Columns Definition
  const columns = [
    {
      field: 'trackingNumber',
      headerName: 'Tracking ID',
      width: 170,
      renderCell: (params) => (
        <Typography fontWeight={700} color="#1E3A8A" sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          {params.value}
        </Typography>
      ),
    },
    { field: 'receiverName', headerName: 'Receiver Name', width: 150 },
    {
      field: 'shipmentStatus',
      headerName: 'Status',
      width: 140,
      renderCell: (params) => {
        let color = 'default';
        switch (params.value) {
          case 'CREATED': color = 'primary'; break;
          case 'ASSIGNED': color = 'info'; break;
          case 'PICKED_UP':
          case 'IN_TRANSIT':
          case 'OUT_FOR_DELIVERY': color = 'warning'; break;
          case 'DELIVERED': color = 'success'; break;
          case 'FAILED':
          case 'CANCELLED': color = 'error'; break;
        }
        return (
          <Box display="flex" alignItems="center" height="100%">
            <Chip label={params.value} color={color} size="small" sx={{ fontWeight: 700 }} />
          </Box>
        );
      },
    },
    { field: 'orderType', headerName: 'Order Type', width: 110 },
    {
      field: 'createdAt',
      headerName: 'Booked On',
      width: 180,
      valueGetter: (value, row) => formatDate(row.createdAt),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 160,
      sortable: false,
      renderCell: (params) => (
        <Box display="flex" gap={0.5} sx={{ height: '100%', alignItems: 'center' }}>
          <IconButton
            color="primary"
            size="small"
            title="View Details"
            onClick={() => handleViewDetails(params.row.trackingNumber)}
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
          {params.row.shipmentStatus === 'CREATED' && (
            <IconButton
              color="info"
              size="small"
              title="Assign Agent"
              onClick={() => handleAssignClick(params.row.trackingNumber)}
            >
              <PersonAddIcon fontSize="small" />
            </IconButton>
          )}
          {params.row.shipmentStatus !== 'CANCELLED' && params.row.shipmentStatus !== 'DELIVERED' && (
            <IconButton
              color="warning"
              size="small"
              title="Change Status"
              onClick={() => handleOverrideClick(params.row.trackingNumber, params.row.shipmentStatus)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      ),
    },
  ];

  return (
    <Card sx={{ borderRadius: 4, boxShadow: '0 8px 24px rgba(0,0,0,0.06)', className: 'fade-in' }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography variant="h5" fontWeight={800} color="#1E293B" sx={{ mb: 3 }}>
          Platform Shipments Portal
        </Typography>

        {/* Filter Controls */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              select
              label="Filter Status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="CREATED">CREATED</MenuItem>
              <MenuItem value="ASSIGNED">ASSIGNED</MenuItem>
              <MenuItem value="PICKED_UP">PICKED_UP</MenuItem>
              <MenuItem value="IN_TRANSIT">IN_TRANSIT</MenuItem>
              <MenuItem value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</MenuItem>
              <MenuItem value="DELIVERED">DELIVERED</MenuItem>
              <MenuItem value="FAILED">FAILED</MenuItem>
              <MenuItem value="CANCELLED">CANCELLED</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Filter Zone"
              value={filterZone}
              onChange={(e) => setFilterZone(e.target.value)}
              placeholder="e.g. North Zone"
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              select
              label="Filter Agent"
              value={filterAgentId}
              onChange={(e) => setFilterAgentId(e.target.value)}
            >
              <MenuItem value="">All Agents</MenuItem>
              {agents.map((a) => (
                <MenuItem key={a.agentId} value={a.agentId}>
                  {a.name} ({a.availability})
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Box component="form" onSubmit={handleSearchSubmit} display="flex" gap={1}>
              <TextField
                fullWidth
                label="Search Track ID/Name"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <Button type="submit" variant="outlined" sx={{ minWidth: 54 }}>
                <SearchIcon />
              </Button>
            </Box>
          </Grid>
        </Grid>

        {loading && shipments.length === 0 ? (
          <Loader message="Loading shipments logs..." />
        ) : (
          <Box sx={{ height: 500, width: '100%', border: '1px solid #E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
            <DataGrid
              rows={shipments}
              columns={columns}
              rowCount={totalElements}
              loading={loading}
              paginationMode="server"
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={[5, 10, 20]}
              disableRowSelectionOnClick
              sx={{
                border: 'none',
                '& .MuiDataGrid-columnHeaders': {
                  bgcolor: '#F8FAFC',
                  borderBottom: '1px solid #E2E8F0',
                },
                '& .MuiDataGrid-cell': {
                  borderBottom: '1px solid #F1F5F9',
                },
              }}
            />
          </Box>
        )}

        {/* Manual Assign Agent Dialog */}
        <Dialog open={assignOpen} onClose={() => setAssignOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Assign Delivery Agent</DialogTitle>
          <DialogContent sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Choose an available delivery agent to dispatch shipment <strong>{selectedTracking}</strong>.
            </Typography>
            <FormControl fullWidth>
              <InputLabel id="agent-assign-label">Select Agent</InputLabel>
              <Select
                labelId="agent-assign-label"
                label="Select Agent"
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
              >
                {agents.map((a) => (
                  <MenuItem key={a.agentId} value={a.agentId} disabled={a.availability !== 'AVAILABLE'}>
                    {a.name} ({a.availability}) - Active Assignments: {a.activeAssignments}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setAssignOpen(false)} color="inherit">Cancel</Button>
            <Button
              onClick={handleAssignSubmit}
              variant="contained"
              sx={{ bgcolor: '#2563EB', '&:hover': { bgcolor: '#1D4ED8' }, fontWeight: 700 }}
            >
              Assign Agent
            </Button>
          </DialogActions>
        </Dialog>

        {/* Status Override Dialog */}
        <Dialog open={overrideOpen} onClose={() => setOverrideOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Override Shipment Status</DialogTitle>
          <DialogContent sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Override the current state of shipment <strong>{selectedTracking}</strong>. This bypasses automated rules.
            </Typography>
            <FormControl fullWidth>
              <InputLabel id="override-status-label">Select Target Status</InputLabel>
              <Select
                labelId="override-status-label"
                label="Select Target Status"
                value={overrideStatus}
                onChange={(e) => setOverrideStatus(e.target.value)}
              >
                <MenuItem value="CREATED">CREATED</MenuItem>
                <MenuItem value="ASSIGNED">ASSIGNED</MenuItem>
                <MenuItem value="PICKED_UP">PICKED_UP</MenuItem>
                <MenuItem value="IN_TRANSIT">IN_TRANSIT</MenuItem>
                <MenuItem value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</MenuItem>
                <MenuItem value="DELIVERED">DELIVERED</MenuItem>
                <MenuItem value="FAILED">FAILED</MenuItem>
                <MenuItem value="CANCELLED">CANCELLED</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setOverrideOpen(false)} color="inherit">Cancel</Button>
            <Button
              onClick={handleOverrideSubmit}
              variant="contained"
              sx={{ bgcolor: '#F59E0B', '&:hover': { bgcolor: '#D97706' }, fontWeight: 700 }}
            >
              Override Status
            </Button>
          </DialogActions>
        </Dialog>

        {/* Shipment Details Dialog */}
        <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="sm" fullWidth>
          {shipmentDetails && (
            <>
              <DialogTitle sx={{ fontWeight: 800 }}>
                Details for {shipmentDetails.trackingNumber}
              </DialogTitle>
              <DialogContent dividers sx={{ py: 2 }}>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">Origin Address</Typography>
                    <Typography variant="body2" fontWeight={600}>{shipmentDetails.pickupAddress}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">Destination Address</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {shipmentDetails.receiverName} ({shipmentDetails.receiverPhone})<br />
                      {shipmentDetails.deliveryAddress}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Status</Typography>
                    <Box sx={{ mt: 0.5 }}>{getStatusChip(shipmentDetails.shipmentStatus)}</Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Order Mode</Typography>
                    <Typography variant="body2" fontWeight={600}>{shipmentDetails.orderType}</Typography>
                  </Grid>
                </Grid>

                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>
                  Tracking Logs Timeline
                </Typography>
                <Box sx={{ borderLeft: '2px solid #E2E8F0', pl: 3, ml: 1 }}>
                  {shipmentTimeline.map((log, i) => (
                    <Box key={i} sx={{ position: 'relative', mb: 2 }}>
                      <Box
                        sx={{
                          position: 'absolute',
                          left: '-30px',
                          top: '4px',
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          bgcolor: getStatusColor(log.shipmentStatus),
                        }}
                      />
                      <Typography variant="subtitle2" color={getStatusColor(log.shipmentStatus)}>
                        {log.shipmentStatus} - {log.location}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(log.eventTime)} | remarks: "{log.remarks}" (by {log.actor})
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDetailsOpen(false)} variant="contained">
                  Close
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </CardContent>
    </Card>
  );
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

export default AdminShipments;
export { getStatusColor };
