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
  Chip,
  IconButton,
  TextField,
  TablePagination,
  Button,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import { notificationService, shipmentService } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import Loader from '../../components/Loader';
import { formatDate, formatWeight } from '../../utils/format';

const AgentHistory = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Search States
  const [searchText, setSearchText] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      // 1. Get assignments from notifications
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

      // 2. Fetch shipment details
      const promises = Array.from(trackingIds).map(async (id) => {
        try {
          return await shipmentService.getByTracking(id);
        } catch {
          return null;
        }
      });

      const list = (await Promise.all(promises)).filter((s) => s !== null);
      
      // 3. Filter for Completed (Terminal) statuses
      const completedList = list.filter(
        (s) => s.shipmentStatus === 'DELIVERED' || s.shipmentStatus === 'FAILED' || s.shipmentStatus === 'CANCELLED'
      );

      setHistory(completedList);
    } catch (err) {
      console.error(err);
      showToast('Error loading completed delivery logs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const getStatusChip = (status) => {
    let color = 'default';
    switch (status) {
      case 'DELIVERED': color = 'success'; break;
      case 'FAILED':
      case 'CANCELLED': color = 'error'; break;
    }
    return <Chip label={status} color={color} size="small" sx={{ fontWeight: 700 }} />;
  };

  // Perform client side search & pagination
  const filteredHistory = history.filter((h) =>
    h.trackingNumber.toLowerCase().includes(searchText.toLowerCase()) ||
    (h.receiverName && h.receiverName.toLowerCase().includes(searchText.toLowerCase()))
  );

  const paginatedHistory = filteredHistory.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleChangePage = (e, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  return (
    <Card sx={{ borderRadius: 4, boxShadow: '0 8px 24px rgba(0,0,0,0.04)', border: '1px solid #E2E8F0', className: 'fade-in' }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography variant="h5" fontWeight={800} color="#1E293B" sx={{ mb: 3 }}>
          Completed Deliveries Ledger
        </Typography>

        {/* Search */}
        <Box display="flex" gap={2} sx={{ mb: 3, maxWidth: 450 }}>
          <TextField
            fullWidth
            label="Search Tracking ID or Receiver"
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setPage(0);
            }}
            InputProps={{
              endAdornment: <SearchIcon color="action" />,
            }}
          />
        </Box>

        {loading ? (
          <Loader message="Loading archived routes database..." />
        ) : (
          <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #E2E8F0', borderRadius: 3 }}>
            <Table>
              <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Tracking ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Receiver</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Drop Address</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Weight</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">No completed deliveries on file.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedHistory.map((row) => (
                    <TableRow key={row.trackingNumber} hover>
                      <TableCell fontWeight={700} color="#1E3A8A">{row.trackingNumber}</TableCell>
                      <TableCell>{row.receiverName}</TableCell>
                      <TableCell>{row.deliveryAddress}</TableCell>
                      <TableCell>{getStatusChip(row.shipmentStatus)}</TableCell>
                      <TableCell>{formatWeight(row.billableWeight)}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="primary"
                          onClick={() => navigate(`/agent/shipments/${row.trackingNumber}`)}
                        >
                          <VisibilityIcon />
                        </IconButton>
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
          count={filteredHistory.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </CardContent>
    </Card>
  );
};

export default AgentHistory;
