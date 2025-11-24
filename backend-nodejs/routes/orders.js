const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const CafeTable = require('../models/CafeTable');
const PaymentConfig = require('../models/PaymentConfig');
const axios = require('axios');
const crypto = require('crypto');
const querystring = require('querystring');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Get all orders (admin only)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'username fullName')
      .populate('tableId', 'tableNumber')
      .sort({ orderTime: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error getting orders:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Get my orders (authenticated)
router.get('/my-orders', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .populate('tableId', 'tableNumber')
      .sort({ orderTime: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error getting my orders:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Get orders by table (authenticated)
router.get('/table/:tableId', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ tableId: req.params.tableId })
      .populate('userId', 'username fullName')
      .sort({ orderTime: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error getting orders by table:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Get order by ID (authenticated)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'username fullName')
      .populate('tableId', 'tableNumber');
    
    if (!order) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Order not found'
      });
    }
    
    // Check if user owns the order or is admin
    if (order.userId._id.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to view this order'
      });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error getting order:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Create order (authenticated)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { tableId, items } = req.body;

    // Validate items and get menu item details
    const orderItems = [];
    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItemId);
      if (!menuItem) {
        return res.status(400).json({
          error: 'Bad Request',
          message: `Menu item ${item.menuItemId} not found`
        });
      }
      orderItems.push({
        menuItemId: menuItem._id,
        menuItemName: menuItem.name,
        quantity: item.quantity,
        price: menuItem.price
      });
    }

    const order = new Order({
      userId: req.user.id,
      tableId,
      items: orderItems
    });

    await order.save();

    // Update table status
    await CafeTable.findByIdAndUpdate(tableId, { status: 'OCCUPIED' });

    const populatedOrder = await Order.findById(order._id)
      .populate('userId', 'username fullName')
      .populate('tableId', 'tableNumber');

    res.status(201).json(populatedOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Create online order (delivery/pickup) (authenticated)
router.post('/online', authMiddleware, async (req, res) => {
  try {
    const { orderType, items, deliveryAddress, deliveryPhone, deliveryFee, paymentMethod, paymentStatus } = req.body;

    if (!orderType || !['DELIVERY', 'PICKUP'].includes(orderType)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Order type must be DELIVERY or PICKUP'
      });
    }

    if (orderType === 'DELIVERY' && (!deliveryAddress || !deliveryPhone)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Delivery address and phone are required for delivery orders'
      });
    }

    // Validate items and get menu item details
    const orderItems = [];
    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItemId);
      if (!menuItem) {
        return res.status(400).json({
          error: 'Bad Request',
          message: `Menu item ${item.menuItemId} not found`
        });
      }
      orderItems.push({
        menuItemId: menuItem._id,
        menuItemName: menuItem.name,
        quantity: item.quantity,
        price: menuItem.price
      });
    }

    const order = new Order({
      userId: req.user.id,
      orderType: orderType,
      items: orderItems,
      deliveryAddress: orderType === 'DELIVERY' ? deliveryAddress : undefined,
      deliveryPhone: orderType === 'DELIVERY' ? deliveryPhone : undefined,
      deliveryFee: deliveryFee || 0,
      paymentMethod: paymentMethod || 'CASH',
      paymentStatus: paymentStatus || 'PENDING'
    });

    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('userId', 'username fullName');

    res.status(201).json(populatedOrder);
  } catch (error) {
    console.error('Error creating online order:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Generate QR code for payment (authenticated)
router.get('/:id/qr-payment', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Order not found'
      });
    }

    // Check if user owns the order
    if (order.userId.toString() !== req.user.id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to access this order'
      });
    }

    const totalAmount = order.totalAmount + (order.deliveryFee || 0);
    const orderCode = order._id.toString().slice(-6);
    const description = `Thanh toan don hang #${orderCode}`;
    
    // Get active payment config from database
    const paymentConfig = await PaymentConfig.findOne({ 
      active: true,
      type: { $in: ['QR_CODE', 'BANK_TRANSFER'] }
    }).sort({ createdAt: -1 });
    
    if (paymentConfig && paymentConfig.qrCodeImage) {
      // Use QR code image from database
      const qrData = {
        type: 'IMAGE',
        qrCodeImage: paymentConfig.qrCodeImage,
        accountNumber: paymentConfig.accountNumber || '',
        accountName: paymentConfig.accountName || '',
        bankCode: paymentConfig.bankCode || '',
        bankName: paymentConfig.bankName || '',
        amount: totalAmount,
        description: description,
        orderId: order._id.toString(),
        orderCode: orderCode,
        paymentConfigId: paymentConfig._id.toString()
      };
      return res.json(qrData);
    }
    
    // Fallback: Generate QR code data (if no config in database)
    const payloadFormatIndicator = '000201';
    const pointOfInitiationMethod = '010212';
    const merchantAccountInfo = '38' + String(50 + orderCode.length).padStart(2, '0') + 
      '0010A000000727' + 
      '01' + String(orderCode.length).padStart(2, '0') + orderCode;
    const transactionCurrency = '5303704';
    const amountStr = String(totalAmount);
    const transactionAmount = '54' + String(amountStr.length + 3).padStart(2, '0') + amountStr + '.00';
    const countryCode = '5802VN';
    const additionalData = '62' + String(8 + orderCode.length).padStart(2, '0') + '08' + String(orderCode.length).padStart(2, '0') + orderCode;
    
    const qrPayload = payloadFormatIndicator + pointOfInitiationMethod + merchantAccountInfo + 
      transactionCurrency + transactionAmount + countryCode + additionalData;
    const crc = '6304';
    const qrString = qrPayload + crc;
    
    const simpleQRString = JSON.stringify({
      bank: 'VCB',
      account: '1234567890',
      name: 'QUAN CAFE',
      amount: totalAmount,
      content: description,
      orderId: order._id.toString()
    });
    
    const qrData = {
      type: 'GENERATED',
      version: '01',
      merchantCode: 'CAFE001',
      orderId: order._id.toString(),
      orderCode: orderCode,
      amount: totalAmount,
      description: description,
      accountNumber: '1234567890',
      accountName: 'QUAN CAFE',
      bankCode: 'VCB',
      bankName: 'Vietcombank',
      qrString: qrString,
      simpleQRString: simpleQRString,
      bankTransferInfo: {
        account: '1234567890',
        name: 'QUAN CAFE',
        bank: 'Vietcombank',
        amount: totalAmount,
        content: description
      }
    };

    res.json(qrData);
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Check payment status (for polling)
router.get('/:id/payment-status', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Order not found'
      });
    }

    // Check if user owns the order
    if (order.userId.toString() !== req.user.id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to access this order'
      });
    }

    res.json({
      paymentStatus: order.paymentStatus,
      orderStatus: order.status
    });
  } catch (error) {
    console.error('Error checking payment status:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Process payment with external API (VNPay, Momo, etc.)
router.post('/:id/process-payment', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Order not found'
      });
    }

    // Check if user owns the order
    if (order.userId.toString() !== req.user.id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to access this order'
      });
    }

    const { paymentConfigId } = req.body;
    const paymentConfig = await PaymentConfig.findById(paymentConfigId);
    
    if (!paymentConfig || !paymentConfig.active) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Payment method not available'
      });
    }

    const totalAmount = order.totalAmount + (order.deliveryFee || 0);
    const orderCode = order._id.toString().slice(-6);
    
    // Handle different payment gateways
    if (paymentConfig.type === 'VNPAY') {
      // VNPay integration
      const vnp_TmnCode = paymentConfig.merchantId || '';
      const vnp_HashSecret = paymentConfig.apiSecret || '';
      const vnp_Url = paymentConfig.apiUrl || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
      const vnp_ReturnUrl = paymentConfig.returnUrl || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/${order._id}/callback`;
      
      const vnp_Params = {};
      vnp_Params['vnp_Version'] = '2.1.0';
      vnp_Params['vnp_Command'] = 'pay';
      vnp_Params['vnp_TmnCode'] = vnp_TmnCode;
      vnp_Params['vnp_Amount'] = totalAmount * 100; // VNPay uses cents
      vnp_Params['vnp_CurrCode'] = 'VND';
      vnp_Params['vnp_TxnRef'] = orderCode;
      vnp_Params['vnp_OrderInfo'] = `Thanh toan don hang #${orderCode}`;
      vnp_Params['vnp_OrderType'] = 'other';
      vnp_Params['vnp_Locale'] = 'vn';
      vnp_Params['vnp_ReturnUrl'] = vnp_ReturnUrl;
      vnp_Params['vnp_IpAddr'] = req.ip || req.connection.remoteAddress;
      vnp_Params['vnp_CreateDate'] = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + '00';
      
      // Sort params and create query string
      const sortedParams = Object.keys(vnp_Params).sort().reduce((result, key) => {
        result[key] = vnp_Params[key];
        return result;
      }, {});
      
      const signData = querystring.stringify(sortedParams, { encode: false });
      const hmac = crypto.createHmac('sha512', vnp_HashSecret);
      const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
      sortedParams['vnp_SecureHash'] = signed;
      
      const paymentUrl = vnp_Url + '?' + querystring.stringify(sortedParams, { encode: false });
      
      res.json({
        success: true,
        paymentUrl: paymentUrl,
        orderId: order._id.toString()
      });
      
    } else if (paymentConfig.type === 'MOMO') {
      // MoMo integration
      const partnerCode = paymentConfig.merchantId || '';
      const accessKey = paymentConfig.apiKey || '';
      const secretKey = paymentConfig.apiSecret || '';
      const requestId = orderCode;
      const orderId = orderCode;
      const orderInfo = `Thanh toan don hang #${orderCode}`;
      const redirectUrl = paymentConfig.returnUrl || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/${order._id}/callback`;
      const ipnUrl = paymentConfig.callbackUrl || `${process.env.BACKEND_URL || 'http://localhost:8080'}/api/orders/${order._id}/payment-webhook`;
      const amount = totalAmount;
      const requestType = 'captureWallet';
      const extraData = '';
      
      // Create signature for MoMo
      const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
      const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');
      
      const momoUrl = paymentConfig.apiUrl || 'https://test-payment.momo.vn/v2/gateway/api/create';
      
      try {
        const response = await axios.post(momoUrl, {
          partnerCode,
          partnerName: 'QUAN CAFE',
          storeId: 'QUANCAFE',
          requestId,
          amount,
          orderId,
          orderInfo,
          redirectUrl,
          ipnUrl,
          lang: 'vi',
          requestType,
          autoCapture: true,
          extraData,
          signature
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.data.payUrl) {
          res.json({
            success: true,
            paymentUrl: response.data.payUrl,
            orderId: order._id.toString()
          });
        } else {
          throw new Error('MoMo payment URL not received');
        }
      } catch (error) {
        console.error('MoMo API error:', error.response?.data || error.message);
        res.status(500).json({
          error: 'Payment Gateway Error',
          message: error.response?.data?.message || error.message
        });
      }
      
    } else {
      // QR_CODE or BANK_TRANSFER - no external API needed
      res.json({
        success: true,
        message: 'Please scan QR code or transfer manually',
        orderId: order._id.toString()
      });
    }
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Payment callback (for VNPay, MoMo redirect)
router.get('/:id/payment-callback', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/${req.params.id}?error=order_not_found`);
    }

    // Handle VNPay callback
    if (req.query.vnp_ResponseCode) {
      const vnp_Params = req.query;
      const secureHash = vnp_Params['vnp_SecureHash'];
      delete vnp_Params['vnp_SecureHash'];
      delete vnp_Params['vnp_SecureHashType'];
      
      const paymentConfig = await PaymentConfig.findOne({ type: 'VNPAY', active: true });
      if (paymentConfig) {
        const signData = querystring.stringify(vnp_Params, { encode: false });
        const hmac = crypto.createHmac('sha512', paymentConfig.apiSecret);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
        
        if (secureHash === signed && vnp_Params['vnp_ResponseCode'] === '00') {
          order.paymentStatus = 'PAID';
          order.paymentMethod = 'ONLINE';
          await order.save();
          return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/${req.params.id}?success=true`);
        }
      }
    }
    
    // Handle MoMo callback
    if (req.query.resultCode) {
      if (req.query.resultCode === '0') {
        order.paymentStatus = 'PAID';
        order.paymentMethod = 'ONLINE';
        await order.save();
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/${req.params.id}?success=true`);
      }
    }
    
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/${req.params.id}?error=payment_failed`);
  } catch (error) {
    console.error('Error processing payment callback:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/${req.params.id}?error=server_error`);
  }
});

// Webhook for bank payment confirmation (public endpoint - bank will call this)
router.post('/:id/payment-webhook', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Order not found'
      });
    }

    // Verify webhook signature based on payment gateway
    const { transactionId, amount, status, signature, paymentConfigId } = req.body;
    
    if (paymentConfigId) {
      const paymentConfig = await PaymentConfig.findById(paymentConfigId);
      
      if (paymentConfig) {
        // Verify signature with payment gateway's secret
        if (paymentConfig.type === 'VNPAY' || paymentConfig.type === 'MOMO') {
          // In production, verify signature with payment gateway's secret key
          // const expectedSignature = crypto.createHmac('sha256', paymentConfig.apiSecret)
          //   .update(JSON.stringify(req.body))
          //   .digest('hex');
          // if (signature !== expectedSignature) {
          //   return res.status(401).json({ error: 'Invalid signature' });
          // }
        }
      }
    }

    if (status === 'SUCCESS' || status === 'PAID') {
      order.paymentStatus = 'PAID';
      order.paymentMethod = 'ONLINE';
      await order.save();
      
      res.json({ success: true, message: 'Payment confirmed' });
    } else {
      res.json({ success: false, message: 'Payment failed' });
    }
  } catch (error) {
    console.error('Error processing payment webhook:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Simulate QR payment (for demo/testing - in production, bank will call webhook)
router.post('/:id/simulate-qr-payment', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Order not found'
      });
    }

    // Simulate payment success after 2 seconds (like real bank processing)
    setTimeout(async () => {
      order.paymentStatus = 'PAID';
      order.paymentMethod = 'ONLINE';
      await order.save();
    }, 2000);

    res.json({ 
      success: true, 
      message: 'Payment simulation started. Payment will be confirmed in 2 seconds.',
      orderId: order._id.toString()
    });
  } catch (error) {
    console.error('Error simulating QR payment:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Process payment (authenticated)
router.post('/:id/payment', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Order not found'
      });
    }

    // Check if user owns the order
    if (order.userId.toString() !== req.user.id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to pay for this order'
      });
    }

    // Simulate payment processing (in real app, integrate with payment gateway)
    order.paymentStatus = 'PAID';
    order.paymentMethod = req.body.paymentMethod || 'ONLINE';
    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('userId', 'username fullName');

    res.json(populatedOrder);
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Update order status (admin only)
router.patch('/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        completedTime: status === 'COMPLETED' ? new Date() : undefined
      },
      { new: true, runValidators: true }
    )
      .populate('userId', 'username fullName')
      .populate('tableId', 'tableNumber');
    
    if (!order) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Order not found'
      });
    }

    // Update table status based on order status
    let tableId = order.tableId;
    // Handle both populated and non-populated tableId
    if (tableId && typeof tableId === 'object' && tableId._id) {
      tableId = tableId._id;
    } else if (tableId && typeof tableId === 'object' && tableId.id) {
      tableId = tableId.id;
    }
    
    if (status === 'COMPLETED') {
      // Check if there are other active orders for this table
      const activeOrders = await Order.find({
        tableId: tableId,
        status: { $in: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'] },
        _id: { $ne: order._id } // Exclude current order
      });
      
      // If no active orders, set table to AVAILABLE so it can be booked again
      if (activeOrders.length === 0) {
        await CafeTable.findByIdAndUpdate(tableId, { status: 'AVAILABLE' });
      } else {
        // If there are still active orders, keep table as OCCUPIED
        await CafeTable.findByIdAndUpdate(tableId, { status: 'OCCUPIED' });
      }
    } else if (status === 'CANCELLED') {
      // If order is cancelled, check if table should be freed
      const activeOrders = await Order.find({
        tableId: tableId,
        status: { $in: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'] },
        _id: { $ne: order._id } // Exclude current order
      });
      
      if (activeOrders.length === 0) {
        await CafeTable.findByIdAndUpdate(tableId, { status: 'AVAILABLE' });
      }
    } else if (status === 'PENDING' || status === 'CONFIRMED' || status === 'PREPARING' || status === 'READY') {
      // If order is active, set table to OCCUPIED
      await CafeTable.findByIdAndUpdate(tableId, { status: 'OCCUPIED' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Transfer table (admin only)
router.patch('/:id/transfer-table', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { newTableId } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { tableId: newTableId },
      { new: true, runValidators: true }
    )
      .populate('userId', 'username fullName')
      .populate('tableId', 'tableNumber');
    
    if (!order) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Order not found'
      });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error transferring table:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

module.exports = router;

