import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  Divider,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PaymentsIcon from '@mui/icons-material/Payments';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { adminService } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { formatCurrency } from '../../utils/format';
import Loader from '../../components/Loader';

const AdminDashboard = () => {
  const { showToast } = useToast();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await adminService.getDashboard();
        setMetrics(data);
      } catch (err) {
        showToast('Failed to load dashboard metrics', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) {
    return <Loader message="Accessing administrative metrics database..." />;
  }

  if (!metrics) return null;

  // Calculate failed shipments on client-side
  const computedFailed = Math.max(0, metrics.totalShipments - (
    metrics.createdShipments +
    metrics.assignedShipments +
    metrics.inTransitShipments +
    metrics.deliveredShipments +
    metrics.cancelledShipments
  ));

  // Data for Shipment Status Distribution (Bar Chart)
  const statusData = [
    { label: 'Created', value: metrics.createdShipments, color: '#3B82F6' },
    { label: 'Assigned', value: metrics.assignedShipments, color: '#06B6D4' },
    { label: 'In Transit', value: metrics.inTransitShipments, color: '#F59E0B' },
    { label: 'Delivered', value: metrics.deliveredShipments, color: '#10B981' },
    { label: 'Failed', value: computedFailed, color: '#EF4444' },
    { label: 'Cancelled', value: metrics.cancelledShipments, color: '#64748B' },
  ];

  const maxVal = Math.max(...statusData.map(d => d.value), 5); // Fallback to 5 to prevent division by 0

  return (
    <Box className="fade-in">
      <Typography variant="h5" fontWeight={800} color="#1E293B" sx={{ mb: 3 }}>
        Logistics Overview Dashboard
      </Typography>

      {/* Six Metric Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Total Orders */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #E2E8F0' }}>
            <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, bgcolor: 'rgba(37,99,235,0.1)', borderRadius: 2, color: '#2563EB' }}>
                <LocalShippingIcon sx={{ fontSize: 30 }} />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  Total Orders
                </Typography>
                <Typography variant="h4" fontWeight={800} color="#1E293B">
                  {metrics.totalShipments}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Delivered */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #E2E8F0' }}>
            <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, bgcolor: 'rgba(16,185,129,0.1)', borderRadius: 2, color: '#10B981' }}>
                <CheckCircleIcon sx={{ fontSize: 30 }} />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  Delivered
                </Typography>
                <Typography variant="h4" fontWeight={800} color="#1E293B">
                  {metrics.deliveredShipments}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Failed */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #E2E8F0' }}>
            <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, bgcolor: 'rgba(239,68,68,0.1)', borderRadius: 2, color: '#EF4444' }}>
                <ErrorIcon sx={{ fontSize: 30 }} />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  Failed
                </Typography>
                <Typography variant="h4" fontWeight={800} color="#1E293B">
                  {computedFailed}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Customers */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #E2E8F0' }}>
            <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, bgcolor: 'rgba(6,182,212,0.1)', borderRadius: 2, color: '#06B6D4' }}>
                <PeopleIcon sx={{ fontSize: 30 }} />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  Customers
                </Typography>
                <Typography variant="h4" fontWeight={800} color="#1E293B">
                  {metrics.totalCustomers}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Agents */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #E2E8F0' }}>
            <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, bgcolor: 'rgba(245,158,11,0.1)', borderRadius: 2, color: '#F59E0B' }}>
                <DirectionsBikeIcon sx={{ fontSize: 30 }} />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  Workforce Agents
                </Typography>
                <Typography variant="h4" fontWeight={800} color="#1E293B">
                  {metrics.totalDeliveryAgents}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Revenue */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #E2E8F0', background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)', color: '#ffffff' }}>
            <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 2, color: '#ffffff' }}>
                <PaymentsIcon sx={{ fontSize: 30 }} />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.8 }} fontWeight={600}>
                  Total Revenue
                </Typography>
                <Typography variant="h4" fontWeight={800}>
                  {formatCurrency(metrics.totalRevenue)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Analytics Charts & Graphs */}
      <Grid container spacing={3}>
        {/* Status Distribution Custom SVG Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
            <Typography variant="subtitle1" fontWeight={800} color="#1E293B" sx={{ mb: 3 }}>
              Order Status Distribution
            </Typography>
            
            {/* Custom Responsive SVG Bar Chart */}
            <Box sx={{ width: '100%', height: 260 }}>
              <svg viewBox="0 0 500 240" width="100%" height="100%">
                {/* Horizontal grid lines */}
                <line x1="40" y1="40" x2="480" y2="40" stroke="#F1F5F9" strokeWidth="1" />
                <line x1="40" y1="90" x2="480" y2="90" stroke="#F1F5F9" strokeWidth="1" />
                <line x1="40" y1="140" x2="480" y2="140" stroke="#F1F5F9" strokeWidth="1" />
                <line x1="40" y1="190" x2="480" y2="190" stroke="#E2E8F0" strokeWidth="1.5" />

                {/* Y-Axis labels */}
                <text x="30" y="44" textAnchor="end" fill="#94A3B8" fontSize="10">{Math.round(maxVal)}</text>
                <text x="30" y="119" textAnchor="end" fill="#94A3B8" fontSize="10">{Math.round(maxVal / 2)}</text>
                <text x="30" y="194" textAnchor="end" fill="#94A3B8" fontSize="10">0</text>

                {/* Draw status bars */}
                {statusData.map((d, index) => {
                  const barWidth = 40;
                  const gap = 30;
                  const x = 50 + index * (barWidth + gap);
                  // Scale height to max 150px
                  const barHeight = (d.value / maxVal) * 150;
                  const y = 190 - barHeight;

                  return (
                    <g key={d.label}>
                      {/* Interactive rect hover */}
                      <rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={barHeight}
                        fill={d.color}
                        rx="4"
                        style={{ transition: 'all 0.3s' }}
                      />
                      {/* Value label above bar */}
                      <text
                        x={x + barWidth / 2}
                        y={y - 8}
                        textAnchor="middle"
                        fill="#1E293B"
                        fontWeight="700"
                        fontSize="11"
                      >
                        {d.value}
                      </text>
                      {/* Label on X-axis */}
                      <text
                        x={x + barWidth / 2}
                        y="210"
                        textAnchor="middle"
                        fill="#64748B"
                        fontSize="10"
                        fontWeight="500"
                      >
                        {d.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </Box>
          </Paper>
        </Grid>

        {/* Workforce Allocations Custom SVG Chart */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid #E2E8F0', boxShadow: 'none', height: '100%' }}>
            <Typography variant="subtitle1" fontWeight={800} color="#1E293B" sx={{ mb: 3 }}>
              Workforce Allocation Status
            </Typography>

            {/* Custom Responsive SVG Donut Chart */}
            <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
              <Box sx={{ width: 140, height: 140 }}>
                <svg viewBox="0 0 36 36" width="100%" height="100%">
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#F1F5F9" strokeWidth="3" />
                  
                  {metrics.totalDeliveryAgents > 0 ? (
                    <>
                      {/* Available segment */}
                      <circle
                        cx="18"
                        cy="18"
                        r="15.915"
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="3.2"
                        strokeDasharray={`${(metrics.availableAgents / metrics.totalDeliveryAgents) * 100} ${100 - (metrics.availableAgents / metrics.totalDeliveryAgents) * 100}`}
                        strokeDashoffset="25"
                      />
                      {/* Busy segment */}
                      <circle
                        cx="18"
                        cy="18"
                        r="15.915"
                        fill="none"
                        stroke="#F59E0B"
                        strokeWidth="3.2"
                        strokeDasharray={`${(metrics.busyAgents / metrics.totalDeliveryAgents) * 100} ${100 - (metrics.busyAgents / metrics.totalDeliveryAgents) * 100}`}
                        strokeDashoffset={25 - ((metrics.availableAgents / metrics.totalDeliveryAgents) * 100)}
                      />
                    </>
                  ) : null}
                  
                  {/* Center Text */}
                  <g className="chart-text">
                    <text x="50%" y="46%" dominantBaseline="middle" textAnchor="middle" fill="#0F172A" fontSize="5" fontWeight="800">
                      {metrics.totalDeliveryAgents}
                    </text>
                    <text x="50%" y="60%" dominantBaseline="middle" textAnchor="middle" fill="#64748B" fontSize="2.2" fontWeight="500">
                      Total Agents
                    </text>
                  </g>
                </svg>
              </Box>

              <Box sx={{ width: '100%' }}>
                <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#10B981' }} />
                    Available (Idle):
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>{metrics.availableAgents}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#F59E0B' }} />
                    Busy (En Route):
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>{metrics.busyAgents}</Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
