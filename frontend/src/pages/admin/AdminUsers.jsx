import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Switch,
  Chip,
  Tabs,
  Tab,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { adminService } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import Loader from '../../components/Loader';
import ConfirmationDialog from '../../components/ConfirmationDialog';

const AdminUsers = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState(0);

  // Tab 0: Customers State
  const [customers, setCustomers] = useState([]);
  const [loadingCust, setLoadingCust] = useState(true);
  const [pageCust, setPageCust] = useState(0);
  const [pageSizeCust, setPageSizeCust] = useState(10);
  const [totalCust, setTotalCust] = useState(0);

  // Tab 1: Delivery Agents State
  const [agents, setAgents] = useState([]);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [pageAgents, setPageAgents] = useState(0);
  const [pageSizeAgents, setPageSizeAgents] = useState(10);
  const [totalAgents, setTotalAgents] = useState(0);

  // Activation/Deactivation State
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetUser, setTargetUser] = useState(null); // { id, name, active, type: 'CUSTOMER' | 'AGENT' }

  const fetchCustomers = async () => {
    setLoadingCust(true);
    try {
      const data = await adminService.getUsers(pageCust, pageSizeCust);
      const allUsers = data.content || [];
      // Filter client side to only customer roles
      const filtered = allUsers.filter(u => u.role === 'CUSTOMER').map(u => ({
        ...u,
        id: u.userId,
      }));
      setCustomers(filtered);
      // Estimate count based on filtering ratio or just length
      setTotalCust(filtered.length);
    } catch (err) {
      showToast('Error loading customer listing', 'error');
    } finally {
      setLoadingCust(false);
    }
  };

  const fetchAgents = async () => {
    setLoadingAgents(true);
    try {
      const data = await adminService.getAgents(pageAgents, pageSizeAgents);
      const list = (data.content || []).map(a => ({
        ...a,
        id: a.agentId,
      }));
      setAgents(list);
      setTotalAgents(data.totalElements || 0);
    } catch (err) {
      showToast('Error loading agent listing', 'error');
    } finally {
      setLoadingAgents(false);
    }
  };

  useEffect(() => {
    if (activeTab === 0) {
      fetchCustomers();
    } else {
      fetchAgents();
    }
  }, [activeTab, pageCust, pageSizeCust, pageAgents, pageSizeAgents]);

  const handleTabChange = (e, val) => {
    setActiveTab(val);
  };

  // Toggle handlers
  const handleToggleCustomer = (row) => {
    setTargetUser({
      userId: row.userId,
      name: row.fullName,
      active: row.active,
      type: 'CUSTOMER',
    });
    setConfirmOpen(true);
  };

  const handleToggleAgent = (row) => {
    setTargetUser({
      userId: row.agentId, // Agent ID maps to user activation in backend
      name: row.name,
      active: row.active,
      type: 'AGENT',
    });
    setConfirmOpen(true);
  };

  const handleConfirmToggle = async () => {
    if (!targetUser) return;
    const isActivating = !targetUser.active;
    try {
      if (isActivating) {
        await adminService.activateUser(targetUser.userId);
        showToast(`Account for ${targetUser.name} is now activated.`, 'success');
      } else {
        await adminService.deactivateUser(targetUser.userId);
        showToast(`Account for ${targetUser.name} has been deactivated.`, 'success');
      }
      if (targetUser.type === 'CUSTOMER') {
        fetchCustomers();
      } else {
        fetchAgents();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Toggle switch failed. Verify User ID mapping.', 'error');
    } finally {
      setConfirmOpen(false);
      setTargetUser(null);
    }
  };

  // Customers Columns
  const customerColumns = [
    { field: 'userId', headerName: 'Customer ID', width: 140 },
    { field: 'fullName', headerName: 'Full Name', width: 220, renderCell: (params) => <Typography fontWeight={600}>{params.value}</Typography> },
    { field: 'email', headerName: 'Email Address', width: 240 },
    {
      field: 'active',
      headerName: 'Status',
      width: 140,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" height="100%">
          <Chip
            label={params.value ? 'ACTIVE' : 'LOCKED'}
            color={params.value ? 'success' : 'default'}
            size="small"
            sx={{ fontWeight: 700 }}
          />
        </Box>
      ),
    },
    {
      field: 'allowSignIn',
      headerName: 'Allow Sign In',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" height="100%">
          <Switch
            checked={params.row.active}
            onChange={() => handleToggleCustomer(params.row)}
            color="primary"
          />
        </Box>
      ),
    },
  ];

  // Agents Columns
  const agentColumns = [
    { field: 'agentId', headerName: 'Agent ID', width: 120 },
    { field: 'name', headerName: 'Full Name', width: 180, renderCell: (params) => <Typography fontWeight={600}>{params.value}</Typography> },
    { field: 'email', headerName: 'Email Address', width: 200 },
    { field: 'phone', headerName: 'Phone Number', width: 150 },
    {
      field: 'availability',
      headerName: 'Availability',
      width: 130,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" height="100%">
          <Chip
            label={params.value}
            color={params.value === 'AVAILABLE' ? 'success' : 'warning'}
            variant="outlined"
            size="small"
            sx={{ fontWeight: 700 }}
          />
        </Box>
      ),
    },
    { field: 'activeAssignments', headerName: 'Active Transits', width: 130, type: 'number' },
    {
      field: 'active',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" height="100%">
          <Chip
            label={params.value ? 'ACTIVE' : 'LOCKED'}
            color={params.value ? 'success' : 'default'}
            size="small"
            sx={{ fontWeight: 700 }}
          />
        </Box>
      ),
    },
    {
      field: 'allowSignIn',
      headerName: 'Allow Sign In',
      width: 140,
      sortable: false,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" height="100%">
          <Switch
            checked={params.row.active}
            onChange={() => handleToggleAgent(params.row)}
            color="primary"
          />
        </Box>
      ),
    },
  ];

  return (
    <Card sx={{ borderRadius: 4, boxShadow: '0 8px 24px rgba(0,0,0,0.06)', className: 'fade-in' }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography variant="h5" fontWeight={800} color="#1E293B" sx={{ mb: 2 }}>
          User Accounts Management
        </Typography>

        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Customers Management" sx={{ fontWeight: 700 }} />
          <Tab label="Delivery Agents Management" sx={{ fontWeight: 700 }} />
        </Tabs>

        {activeTab === 0 ? (
          loadingCust && customers.length === 0 ? (
            <Loader message="Loading customers ledger..." />
          ) : (
            <Box sx={{ height: 480, width: '100%', border: '1px solid #E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
              <DataGrid
                rows={customers}
                columns={customerColumns}
                rowCount={totalCust}
                loading={loadingCust}
                paginationMode="server"
                pageSizeOptions={[5, 10, 20]}
                disableRowSelectionOnClick
                sx={{ border: 'none' }}
              />
            </Box>
          )
        ) : (
          loadingAgents && agents.length === 0 ? (
            <Loader message="Loading delivery agent ledger..." />
          ) : (
            <Box sx={{ height: 480, width: '100%', border: '1px solid #E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
              <DataGrid
                rows={agents}
                columns={agentColumns}
                rowCount={totalAgents}
                loading={loadingAgents}
                paginationMode="server"
                pageSizeOptions={[5, 10, 20]}
                disableRowSelectionOnClick
                sx={{ border: 'none' }}
              />
            </Box>
          )
        )}

        {/* Confirmation Dialog */}
        {targetUser && (
          <ConfirmationDialog
            open={confirmOpen}
            title={targetUser.active ? 'Lock User Account?' : 'Unlock User Account?'}
            message={
              targetUser.active
                ? `Are you sure you want to deactivate account for ${targetUser.name}? They will be locked out immediately.`
                : `Are you sure you want to activate account for ${targetUser.name}? They will be allowed to sign in.`
            }
            confirmText={targetUser.active ? 'Deactivate' : 'Activate'}
            onConfirm={handleConfirmToggle}
            onCancel={() => {
              setConfirmOpen(false);
              setTargetUser(null);
            }}
            severity={targetUser.active ? 'error' : 'info'}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default AdminUsers;
