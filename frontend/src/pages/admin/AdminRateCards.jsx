import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  IconButton,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Chip,
  Paper,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import PublicIcon from '@mui/icons-material/Public';
import AddLocationIcon from '@mui/icons-material/AddLocation';
import PaymentsIcon from '@mui/icons-material/Payments';
import { adminService } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { formatCurrency } from '../../utils/format';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import Loader from '../../components/Loader';

const AdminRateCards = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState(0);

  // Rate Cards List State
  const [rateCards, setRateCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  // Dialog States
  const [rateCardOpen, setRateCardOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // Zones & Areas CRUD State
  const [zonesList, setZonesList] = useState([
    { id: 1, zoneName: 'North Zone' },
    { id: 2, zoneName: 'South Zone' },
    { id: 3, zoneName: 'West Zone' },
    { id: 4, zoneName: 'East Zone' },
  ]);
  const [areasList, setAreasList] = useState([
    { id: 1, areaName: 'Connaught Place', pincode: '110001', city: 'Delhi', zoneId: 1 },
    { id: 2, areaName: 'Okhla Industrial Area', pincode: '110020', city: 'Delhi', zoneId: 1 },
    { id: 3, areaName: 'Indiranagar', pincode: '560038', city: 'Bangalore', zoneId: 2 },
    { id: 4, areaName: 'Bandra West', pincode: '400050', city: 'Mumbai', zoneId: 3 },
  ]);

  // Zone Form State
  const [zoneFormOpen, setZoneFormOpen] = useState(false);
  const [isZoneEdit, setIsZoneEdit] = useState(false);
  const [zoneId, setZoneId] = useState('');
  const [zoneName, setZoneName] = useState('');

  // Area Form State
  const [areaFormOpen, setAreaFormOpen] = useState(false);
  const [isAreaEdit, setIsAreaEdit] = useState(false);
  const [areaId, setAreaId] = useState('');
  const [areaName, setAreaName] = useState('');
  const [areaPincode, setAreaPincode] = useState('');
  const [areaCity, setAreaCity] = useState('');
  const [areaZoneId, setAreaZoneId] = useState('');

  // Rate Card Form State
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    pickupZoneId: '',
    deliveryZoneId: '',
    minimumWeight: '0.00',
    maximumWeight: '50.00',
    baseCharge: '',
    pricePerKg: '',
    codCharge: '0.00',
    fuelSurcharge: '0.00',
    orderType: 'B2C',
    active: true,
  });

  const fetchRateCards = async () => {
    setLoading(true);
    try {
      const data = await adminService.getRateCards(page, pageSize);
      const list = (data.content || []).map((rc, index) => ({
        ...rc,
        id: rc.id || index,
      }));
      setRateCards(list);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      showToast('Error loading rate cards ledger', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 0) {
      fetchRateCards();
    }
  }, [page, pageSize, activeTab]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // CRUD actions for Rate Cards
  const handleRateCardSubmit = async (e) => {
    e.preventDefault();
    if (!formData.pickupZoneId || !formData.deliveryZoneId || !formData.baseCharge || !formData.pricePerKg) {
      showToast('Please fill in all rate card details.', 'warning');
      return;
    }

    const payload = {
      minimumWeight: parseFloat(formData.minimumWeight),
      maximumWeight: parseFloat(formData.maximumWeight),
      baseCharge: parseFloat(formData.baseCharge),
      pricePerKg: parseFloat(formData.pricePerKg),
      codCharge: parseFloat(formData.codCharge),
      fuelSurcharge: parseFloat(formData.fuelSurcharge),
      orderType: formData.orderType,
      active: formData.active,
    };

    try {
      if (isEditMode) {
        await adminService.updateRateCard(selectedId, payload, formData.pickupZoneId, formData.deliveryZoneId);
        showToast('Rate Card updated successfully.', 'success');
      } else {
        await adminService.createRateCard(payload, formData.pickupZoneId, formData.deliveryZoneId);
        showToast('Rate Card created successfully.', 'success');
      }
      fetchRateCards();
      setRateCardOpen(false);
      resetForm();
    } catch (err) {
      showToast(err.response?.data?.message || 'Rate Card configuration error', 'error');
    }
  };

  const handleEditClick = (row) => {
    setIsEditMode(true);
    setSelectedId(row.id);
    setFormData({
      pickupZoneId: '', // Zone IDs will be input manually
      deliveryZoneId: '',
      minimumWeight: row.minimumWeight || '0.00',
      maximumWeight: row.maximumWeight || '50.00',
      baseCharge: row.baseCharge,
      pricePerKg: row.pricePerKg,
      codCharge: row.codCharge || '0.00',
      fuelSurcharge: row.fuelSurcharge || '0.00',
      orderType: row.orderType,
      active: row.active,
    });
    setRateCardOpen(true);
  };

  const handleDeleteClick = (id) => {
    setSelectedId(id);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await adminService.deleteRateCard(selectedId);
      showToast('Rate card deleted successfully.', 'success');
      fetchRateCards();
    } catch (err) {
      showToast('Failed to delete rate card.', 'error');
    } finally {
      setDeleteOpen(false);
      setSelectedId(null);
    }
  };

  // CRUD Actions for Zones (Simulated with Local list & REST mapping)
  const handleZoneSubmit = async (e) => {
    e.preventDefault();
    if (!zoneName) return;

    try {
      if (isZoneEdit) {
        await adminService.updateZone(zoneId, { zoneName });
        setZonesList(prev => prev.map(z => z.id === zoneId ? { ...z, zoneName } : z));
        showToast('Zone updated successfully.', 'success');
      } else {
        const response = await adminService.createZone({ zoneName });
        const newId = response.id || Date.now();
        setZonesList(prev => [...prev, { id: newId, zoneName }]);
        showToast(`Zone [${zoneName}] registered successfully.`, 'success');
      }
      setZoneFormOpen(false);
      setZoneName('');
      setZoneId('');
      setIsZoneEdit(false);
    } catch (err) {
      showToast('Error configuring Zone', 'error');
    }
  };

  const handleZoneEditClick = (z) => {
    setIsZoneEdit(true);
    setZoneId(z.id);
    setZoneName(z.zoneName);
    setZoneFormOpen(true);
  };

  const handleZoneDeleteClick = async (id) => {
    try {
      await adminService.deleteZone(id);
      setZonesList(prev => prev.filter(z => z.id !== id));
      showToast('Zone deleted successfully.', 'success');
    } catch (err) {
      showToast('Error deleting Zone', 'error');
    }
  };

  // CRUD Actions for Areas
  const handleAreaSubmit = async (e) => {
    e.preventDefault();
    if (!areaName || !areaPincode || !areaCity || !areaZoneId) return;

    const payload = { areaName, pincode: areaPincode, city: areaCity };
    const zoneInt = parseInt(areaZoneId, 10);

    try {
      if (isAreaEdit) {
        await adminService.updateArea(areaId, payload, zoneInt);
        setAreasList(prev => prev.map(a => a.id === areaId ? { ...a, areaName, pincode: areaPincode, city: areaCity, zoneId: zoneInt } : a));
        showToast('Area pin mapping updated successfully.', 'success');
      } else {
        const response = await adminService.createArea(payload, zoneInt);
        const newId = response.id || Date.now();
        setAreasList(prev => [...prev, { id: newId, areaName, pincode: areaPincode, city: areaCity, zoneId: zoneInt }]);
        showToast(`Area [${areaName}] registered successfully.`, 'success');
      }
      setAreaFormOpen(false);
      resetAreaForm();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error configuring Area pin', 'error');
    }
  };

  const handleAreaEditClick = (a) => {
    setIsAreaEdit(true);
    setAreaId(a.id);
    setAreaName(a.areaName);
    setAreaPincode(a.pincode);
    setAreaCity(a.city);
    setAreaZoneId(a.zoneId);
    setAreaFormOpen(true);
  };

  const handleAreaDeleteClick = async (id) => {
    try {
      await adminService.deleteArea(id);
      setAreasList(prev => prev.filter(a => a.id !== id));
      showToast('Area deleted successfully.', 'success');
    } catch (err) {
      showToast('Error deleting Area', 'error');
    }
  };

  const resetForm = () => {
    setIsEditMode(false);
    setSelectedId(null);
    setFormData({
      pickupZoneId: '',
      deliveryZoneId: '',
      minimumWeight: '0.00',
      maximumWeight: '50.00',
      baseCharge: '',
      pricePerKg: '',
      codCharge: '0.00',
      fuelSurcharge: '0.00',
      orderType: 'B2C',
      active: true,
    });
  };

  const resetAreaForm = () => {
    setIsAreaEdit(false);
    setAreaId('');
    setAreaName('');
    setAreaPincode('');
    setAreaCity('');
    setAreaZoneId('');
  };

  // Columns for DataGrid (Rate Cards Grid)
  const columns = [
    { field: 'pickupZone', headerName: 'Pickup Zone', width: 140 },
    { field: 'deliveryZone', headerName: 'Delivery Zone', width: 140 },
    {
      field: 'baseCharge',
      headerName: 'Base Charge',
      width: 120,
      renderCell: (params) => formatCurrency(params.value),
    },
    {
      field: 'pricePerKg',
      headerName: 'Price Per Kg',
      width: 120,
      renderCell: (params) => formatCurrency(params.value),
    },
    { field: 'orderType', headerName: 'Order Type', width: 110 },
    {
      field: 'active',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" height="100%">
          <Chip label={params.value ? 'ACTIVE' : 'INACTIVE'} color={params.value ? 'success' : 'default'} size="small" sx={{ fontWeight: 700 }} />
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 130,
      sortable: false,
      renderCell: (params) => (
        <Box display="flex" gap={1} height="100%" alignItems="center">
          <IconButton color="primary" onClick={() => handleEditClick(params.row)}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton color="error" onClick={() => handleDeleteClick(params.row.id)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Card sx={{ borderRadius: 4, boxShadow: '0 8px 24px rgba(0,0,0,0.06)', className: 'fade-in' }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography variant="h5" fontWeight={800} color="#1E293B" sx={{ mb: 2 }}>
          Billing, Zones & Rate Cards
        </Typography>

        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Rate Cards Desk" sx={{ fontWeight: 700 }} />
          <Tab label="Zone Management" sx={{ fontWeight: 700 }} />
          <Tab label="Area Management" sx={{ fontWeight: 700 }} />
        </Tabs>

        {/* Tab 0: Rate Cards CRUD */}
        {activeTab === 0 && (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} color="text.secondary">
                Registered Shipping Rates Matrix
              </Typography>
              <Button
                variant="contained"
                onClick={() => {
                  resetForm();
                  setRateCardOpen(true);
                }}
                startIcon={<AddCircleIcon />}
                sx={{ bgcolor: '#2563EB', '&:hover': { bgcolor: '#1D4ED8' } }}
              >
                Create Rate Card
              </Button>
            </Box>

            {loading && rateCards.length === 0 ? (
              <Loader message="Loading rate cards desk..." />
            ) : (
              <Box sx={{ height: 480, width: '100%', border: '1px solid #E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
                <DataGrid
                  rows={rateCards}
                  columns={columns}
                  rowCount={totalElements}
                  loading={loading}
                  paginationMode="server"
                  paginationModel={{ page, pageSize }}
                  onPaginationModelChange={(model) => {
                    setPage(model.page);
                    setPageSize(model.pageSize);
                  }}
                  pageSizeOptions={[5, 10, 20]}
                  disableRowSelectionOnClick
                  sx={{ border: 'none' }}
                />
              </Box>
            )}
          </Box>
        )}

        {/* Tab 1: Zone CRUD */}
        {activeTab === 1 && (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} color="text.secondary">
                Registered Zones Registry
              </Typography>
              <Button
                variant="contained"
                onClick={() => {
                  setIsZoneEdit(false);
                  setZoneName('');
                  setZoneId('');
                  setZoneFormOpen(true);
                }}
                startIcon={<PublicIcon />}
              >
                Add Zone
              </Button>
            </Box>

            <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #E2E8F0', borderRadius: 3 }}>
              <Table sx={{ minWidth: 500 }}>
                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Zone ID</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Zone Name</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {zonesList.map((z) => (
                    <TableRow key={z.id} hover>
                      <TableCell>{z.id}</TableCell>
                      <TableCell fontWeight={600}>{z.zoneName}</TableCell>
                      <TableCell align="center">
                        <Box display="flex" justifyContent="center" gap={1}>
                          <IconButton color="primary" onClick={() => handleZoneEditClick(z)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton color="error" onClick={() => handleZoneDeleteClick(z.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Tab 2: Area CRUD */}
        {activeTab === 2 && (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} color="text.secondary">
                Registered Areas & Pincodes Map
              </Typography>
              <Button
                variant="contained"
                onClick={() => {
                  resetAreaForm();
                  setAreaFormOpen(true);
                }}
                startIcon={<AddLocationIcon />}
              >
                Map Area Pincode
              </Button>
            </Box>

            <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #E2E8F0', borderRadius: 3 }}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Area ID</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Area Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>City</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Pincode (ZIP)</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Parent Zone ID</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {areasList.map((a) => (
                    <TableRow key={a.id} hover>
                      <TableCell>{a.id}</TableCell>
                      <TableCell fontWeight={600}>{a.areaName}</TableCell>
                      <TableCell>{a.city}</TableCell>
                      <TableCell fontWeight={700} color="#1E3A8A">{a.pincode}</TableCell>
                      <TableCell>{a.zoneId}</TableCell>
                      <TableCell align="center">
                        <Box display="flex" justifyContent="center" gap={1}>
                          <IconButton color="primary" onClick={() => handleAreaEditClick(a)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton color="error" onClick={() => handleAreaDeleteClick(a.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Create/Edit Rate Card Dialog */}
        <Dialog open={rateCardOpen} onClose={() => setRateCardOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 800 }}>
            {isEditMode ? 'Modify Pricing Rate Card' : 'Define New Pricing Rate Card'}
          </DialogTitle>
          <form onSubmit={handleRateCardSubmit}>
            <DialogContent sx={{ pt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Pickup Zone ID"
                    type="number"
                    value={formData.pickupZoneId}
                    onChange={(e) => setFormData({ ...formData, pickupZoneId: e.target.value })}
                    placeholder="e.g. 1"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Delivery Zone ID"
                    type="number"
                    value={formData.deliveryZoneId}
                    onChange={(e) => setFormData({ ...formData, deliveryZoneId: e.target.value })}
                    placeholder="e.g. 2"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Minimum Weight (kg)"
                    type="number"
                    value={formData.minimumWeight}
                    onChange={(e) => setFormData({ ...formData, minimumWeight: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Maximum Weight (kg)"
                    type="number"
                    value={formData.maximumWeight}
                    onChange={(e) => setFormData({ ...formData, maximumWeight: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Base Charge (Intra/Inter)"
                    type="number"
                    value={formData.baseCharge}
                    onChange={(e) => setFormData({ ...formData, baseCharge: e.target.value })}
                    placeholder="e.g. 150.00"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Overage Charge (Per kg)"
                    type="number"
                    value={formData.pricePerKg}
                    onChange={(e) => setFormData({ ...formData, pricePerKg: e.target.value })}
                    placeholder="e.g. 25.00"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="COD Surcharge Fee"
                    type="number"
                    value={formData.codCharge}
                    onChange={(e) => setFormData({ ...formData, codCharge: e.target.value })}
                    placeholder="e.g. 50.00"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Fuel Surcharge Fee"
                    type="number"
                    value={formData.fuelSurcharge}
                    onChange={(e) => setFormData({ ...formData, fuelSurcharge: e.target.value })}
                    placeholder="e.g. 30.00"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Applicable Order Type"
                    value={formData.orderType}
                    onChange={(e) => setFormData({ ...formData, orderType: e.target.value })}
                  >
                    <MenuItem value="B2C">B2C (Retail)</MenuItem>
                    <MenuItem value="B2B">B2B (Corporate)</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Rate Status"
                    value={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.value === 'true' })}
                  >
                    <MenuItem value="true">ACTIVE</MenuItem>
                    <MenuItem value="false">INACTIVE</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5 }}>
              <Button onClick={() => setRateCardOpen(false)} color="inherit">
                Cancel
              </Button>
              <Button type="submit" variant="contained" sx={{ fontWeight: 700 }}>
                {isEditMode ? 'Update Card' : 'Save Card'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Create/Edit Zone Dialog */}
        <Dialog open={zoneFormOpen} onClose={() => setZoneFormOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontWeight: 800 }}>
            {isZoneEdit ? 'Edit Zone' : 'Register Zone'}
          </DialogTitle>
          <form onSubmit={handleZoneSubmit}>
            <DialogContent sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                required
                fullWidth
                label="Zone Name"
                value={zoneName}
                onChange={(e) => setZoneName(e.target.value)}
                placeholder="e.g. North Zone"
              />
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5 }}>
              <Button onClick={() => setZoneFormOpen(false)} color="inherit">Cancel</Button>
              <Button type="submit" variant="contained" sx={{ fontWeight: 700 }}>Save Zone</Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Create/Edit Area Dialog */}
        <Dialog open={areaFormOpen} onClose={() => setAreaFormOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontWeight: 800 }}>
            {isAreaEdit ? 'Edit Area Pin Mapping' : 'Register Area Pin Mapping'}
          </DialogTitle>
          <form onSubmit={handleAreaSubmit}>
            <DialogContent sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                required
                fullWidth
                label="Area Name"
                value={areaName}
                onChange={(e) => setAreaName(e.target.value)}
                placeholder="e.g. Okhla"
              />
              <TextField
                required
                fullWidth
                label="City"
                value={areaCity}
                onChange={(e) => setAreaCity(e.target.value)}
                placeholder="e.g. New Delhi"
              />
              <TextField
                required
                fullWidth
                label="Pincode (ZIP)"
                value={areaPincode}
                onChange={(e) => setAreaPincode(e.target.value)}
                placeholder="e.g. 110020"
              />
              <TextField
                required
                fullWidth
                label="Parent Zone ID"
                type="number"
                value={areaZoneId}
                onChange={(e) => setAreaZoneId(e.target.value)}
                placeholder="e.g. 1"
              />
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5 }}>
              <Button onClick={() => setAreaFormOpen(false)} color="inherit">Cancel</Button>
              <Button type="submit" variant="contained" sx={{ fontWeight: 700 }}>Save Area</Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          open={deleteOpen}
          title="Delete Rate Card?"
          message="Are you sure you want to delete this pricing card mapping? Shipping orders calculation between these zones might fail."
          confirmText="Yes, Delete"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteOpen(false)}
          severity="error"
        />
      </CardContent>
    </Card>
  );
};

export default AdminRateCards;
