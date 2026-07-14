import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  TextField,
  Grid,
  Card,
  CardContent,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  Alert,
  CircularProgress,
  InputAdornment,
  MenuItem,
  Paper,
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CalculateIcon from '@mui/icons-material/Calculate';
import PaymentsIcon from '@mui/icons-material/Payments';
import { shipmentService } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { formatCurrency, formatWeight } from '../../utils/format';

const CreateShipment = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [estimating, setEstimating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    pickupAddress: '',
    pickupPincode: '',
    deliveryAddress: '', // Maps to Drop Address
    deliveryPincode: '', // Destination pincode
    receiverName: '',
    receiverPhone: '',
    actualWeight: '',
    length: '',
    width: '',
    height: '',
    orderType: 'B2C',
    paymentType: 'PREPAID',
  });

  // Backend Estimated Charge State
  const [estimate, setEstimate] = useState(null);
  const [isCalculated, setIsCalculated] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMsg('');
    // Reset calculation state if weights/dims/pincodes change
    if (['actualWeight', 'length', 'width', 'height', 'pickupPincode', 'deliveryPincode', 'orderType'].includes(name)) {
      setIsCalculated(false);
      setEstimate(null);
    }
  };

  const handleCalculateCharges = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Field validations
    if (
      !formData.pickupAddress ||
      !formData.pickupPincode ||
      !formData.deliveryAddress ||
      !formData.deliveryPincode ||
      !formData.receiverName ||
      !formData.receiverPhone ||
      !formData.actualWeight ||
      !formData.length ||
      !formData.width ||
      !formData.height
    ) {
      setErrorMsg('Please fill in all shipment fields before calculating charges.');
      return;
    }

    setEstimating(true);
    try {
      const payload = {
        ...formData,
        actualWeight: parseFloat(formData.actualWeight),
        length: parseFloat(formData.length),
        width: parseFloat(formData.width),
        height: parseFloat(formData.height),
      };
      
      const res = await shipmentService.estimate(payload);
      
      // Calculate volumetric and billable weights locally to display in the invoice
      const lengthVal = parseFloat(formData.length) || 0;
      const widthVal = parseFloat(formData.width) || 0;
      const heightVal = parseFloat(formData.height) || 0;
      const actualWeightVal = parseFloat(formData.actualWeight) || 0;
      const volumetricWeight = (lengthVal * widthVal * heightVal) / 5000;
      const billableWeight = Math.max(actualWeightVal, volumetricWeight);

      setEstimate({
        ...res,
        volumetricWeight,
        billableWeight,
        overweightCharge: res.weightCharge || 0
      });
      setIsCalculated(true);
      showToast('Delivery charge calculated successfully!', 'success');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to estimate charges. Check pin codes.');
      showToast('Estimation failed', 'error');
    } finally {
      setEstimating(false);
    }
  };

  const handleCreateShipment = async () => {
    if (!isCalculated || !estimate) {
      setErrorMsg('Please calculate delivery charges before creating the shipment.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const payload = {
        ...formData,
        actualWeight: parseFloat(formData.actualWeight),
        length: parseFloat(formData.length),
        width: parseFloat(formData.width),
        height: parseFloat(formData.height),
      };
      
      const response = await shipmentService.create(payload);
      showToast(`Shipment successfully booked! Tracking ID: ${response.trackingNumber}`, 'success');
      navigate('/customer/shipments');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Error booking shipment. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="fade-in">
      <Typography variant="h5" fontWeight={800} color="#1E293B" sx={{ mb: 3 }}>
        Book New Shipment
      </Typography>

      {errorMsg && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
          {errorMsg}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Left Side - Booking Input Fields */}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 4, boxShadow: '0 8px 24px rgba(0,0,0,0.04)', border: '1px solid #E2E8F0' }}>
            <CardContent sx={{ p: 4 }}>
              <Grid container spacing={3}>
                {/* 1. Address Section */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight={700} color="#2563EB" sx={{ mb: 1 }}>
                    1. Shipping Route addresses
                  </Typography>
                  <Divider />
                </Grid>
                
                <Grid item xs={12} sm={8}>
                  <TextField
                    required
                    fullWidth
                    label="Pickup Address"
                    name="pickupAddress"
                    value={formData.pickupAddress}
                    onChange={handleInputChange}
                    placeholder="Consignor pickup door address"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    required
                    fullWidth
                    label="Pickup Pin Code"
                    name="pickupPincode"
                    value={formData.pickupPincode}
                    onChange={handleInputChange}
                    placeholder="6-digit ZIP"
                  />
                </Grid>

                <Grid item xs={12} sm={8}>
                  <TextField
                    required
                    fullWidth
                    label="Drop Address"
                    name="deliveryAddress"
                    value={formData.deliveryAddress}
                    onChange={handleInputChange}
                    placeholder="Consignee delivery destination address"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    required
                    fullWidth
                    label="Drop Pin Code"
                    name="deliveryPincode"
                    value={formData.deliveryPincode}
                    onChange={handleInputChange}
                    placeholder="6-digit ZIP"
                  />
                </Grid>

                {/* 2. Consignee Info */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight={700} color="#2563EB" sx={{ mb: 1, mt: 1 }}>
                    2. Recipient Contact Info
                  </Typography>
                  <Divider />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Receiver's Name"
                    name="receiverName"
                    value={formData.receiverName}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Receiver's Phone"
                    name="receiverPhone"
                    value={formData.receiverPhone}
                    onChange={handleInputChange}
                  />
                </Grid>

                {/* 3. Weight & Volumetric Details */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight={700} color="#2563EB" sx={{ mb: 1, mt: 1 }}>
                    3. Cargo Metrics & Dimensions
                  </Typography>
                  <Divider />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Actual Weight"
                    name="actualWeight"
                    type="number"
                    value={formData.actualWeight}
                    onChange={handleInputChange}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">kg</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    required
                    fullWidth
                    label="Order Type"
                    name="orderType"
                    value={formData.orderType}
                    onChange={handleInputChange}
                  >
                    <MenuItem value="B2C">B2C (Retail)</MenuItem>
                    <MenuItem value="B2B">B2B (Corporate)</MenuItem>
                  </TextField>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <TextField
                    required
                    fullWidth
                    label="Package Length"
                    name="length"
                    type="number"
                    value={formData.length}
                    onChange={handleInputChange}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">cm</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    required
                    fullWidth
                    label="Package Width"
                    name="width"
                    type="number"
                    value={formData.width}
                    onChange={handleInputChange}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">cm</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    required
                    fullWidth
                    label="Package Height"
                    name="height"
                    type="number"
                    value={formData.height}
                    onChange={handleInputChange}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">cm</InputAdornment>,
                    }}
                  />
                </Grid>

                {/* 4. Payment Terms */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight={700} color="#2563EB" sx={{ mb: 1, mt: 1 }}>
                    4. Payment Type Option
                  </Typography>
                  <Divider />
                </Grid>
                <Grid item xs={12}>
                  <RadioGroup
                    row
                    name="paymentType"
                    value={formData.paymentType}
                    onChange={handleInputChange}
                  >
                    <FormControlLabel
                      value="PREPAID"
                      control={<Radio />}
                      label="PREPAID (Card/UPI)"
                      sx={{ mr: 4 }}
                    />
                    <FormControlLabel
                      value="COD"
                      control={<Radio />}
                      label="COD (Cash on Delivery)"
                    />
                  </RadioGroup>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Side - Estimated Summary Panel */}
        <Grid item xs={12} md={4}>
          <Box sx={{ position: 'sticky', top: 90 }}>
            {/* Calculation Card */}
            <Card sx={{ borderRadius: 4, mb: 3, boxShadow: '0 8px 24px rgba(0,0,0,0.04)', border: '1px solid #E2E8F0' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={800} align="center" gutterBottom color="#1E293B">
                  Pricing Invoice
                </Typography>
                <Divider sx={{ my: 1.5 }} />

                {estimating ? (
                  <Box display="flex" flexDirection="column" alignItems="center" py={4}>
                    <CircularProgress size={40} sx={{ mb: 1.5 }} />
                    <Typography variant="caption" color="text.secondary">
                      Loading rates card from backend...
                    </Typography>
                  </Box>
                ) : isCalculated && estimate ? (
                  <Box>
                    <Box display="flex" justifyContent="space-between" sx={{ mb: 1.5 }}>
                      <Typography variant="body2" color="text.secondary">Volumetric Weight:</Typography>
                      <Typography variant="body2" fontWeight={600}>{formatWeight(estimate.volumetricWeight)}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" sx={{ mb: 1.5 }}>
                      <Typography variant="body2" color="text.secondary">Billable Weight:</Typography>
                      <Typography variant="body2" fontWeight={600}>{formatWeight(estimate.billableWeight)}</Typography>
                    </Box>
                    <Divider sx={{ my: 1.5 }} />
                    <Box display="flex" justifyContent="space-between" sx={{ mb: 1.5 }}>
                      <Typography variant="body2" color="text.secondary">Base Charge:</Typography>
                      <Typography variant="body2" fontWeight={600}>{formatCurrency(estimate.baseCharge)}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" sx={{ mb: 1.5 }}>
                      <Typography variant="body2" color="text.secondary">Overweight Charge:</Typography>
                      <Typography variant="body2" fontWeight={600}>{formatCurrency(estimate.overweightCharge)}</Typography>
                    </Box>
                    <Divider sx={{ my: 1.5 }} />
                    <Box display="flex" justifyContent="space-between" sx={{ pt: 1, mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight={800}>Delivery Charge:</Typography>
                      <Typography variant="subtitle1" fontWeight={800} color="#2563EB">
                        {formatCurrency(estimate.totalCharge)}
                      </Typography>
                    </Box>

                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleCreateShipment}
                      disabled={loading}
                      sx={{
                        bgcolor: '#10B981',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        py: 1.5,
                        borderRadius: 2,
                        '&:hover': { bgcolor: '#059669' },
                      }}
                    >
                      {loading ? 'Creating shipment...' : 'Confirm & Book'}
                    </Button>
                  </Box>
                ) : (
                  <Box display="flex" flexDirection="column" alignItems="center" py={4} sx={{ textAlign: 'center' }}>
                    <CalculateIcon sx={{ fontSize: 40, color: '#94A3B8', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Input route addresses, pin codes, and package dimensions to calculate shipping charges.
                    </Typography>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleCalculateCharges}
                      sx={{
                        bgcolor: '#2563EB',
                        fontWeight: 700,
                        py: 1.5,
                        borderRadius: 2,
                        '&:hover': { bgcolor: '#1D4ED8' },
                      }}
                    >
                      Calculate Charge
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Calculate Button when calculated */}
            {isCalculated && (
              <Button
                fullWidth
                variant="outlined"
                onClick={handleCalculateCharges}
                startIcon={<CalculateIcon />}
                sx={{
                  py: 1.25,
                  fontWeight: 700,
                  borderRadius: 2,
                  borderColor: '#2563EB',
                  color: '#2563EB',
                }}
              >
                Recalculate Rate
              </Button>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CreateShipment;
