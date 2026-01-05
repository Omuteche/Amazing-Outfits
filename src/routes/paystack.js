const express = require('express');
const crypto = require('crypto');
const Order = require('../models/Order');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { sendOrderConfirmationEmail } = require('../utils/email');

const router = express.Router();

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

// Initialize payment
router.post('/initialize', auth, async (req, res) => {
  try {
    const { orderId, email, amount } = req.body;

    if (!PAYSTACK_SECRET) {
      return res.status(500).json({ error: 'Paystack secret key not configured' });
    }

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        amount: Math.round(amount * 100), // Convert to kobo
        reference: `order_${orderId}_${Date.now()}`,
        callback_url: `${req.headers.origin}/payment/callback`,
        metadata: {
          orderId,
          userId: req.user._id.toString()
        }
      })
    });

    const data = await response.json();
    
    if (!data.status) {
      return res.status(400).json({ error: data.message || 'Payment initialization failed' });
    }

    res.json(data.data);
  } catch (error) {
    console.error('Paystack init error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verify payment
router.get('/verify/:reference', auth, async (req, res) => {
  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${req.params.reference}`, {
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET}`
      }
    });

    const data = await response.json();

    if (!data.status) {
      return res.status(400).json({ error: data.message || 'Verification failed' });
    }

    const { metadata, status } = data.data;

    let orderNumber = null;
    if (status === 'success' && metadata?.orderId) {
      const order = await Order.findByIdAndUpdate(metadata.orderId, {
        paymentStatus: 'paid',
        paymentReference: req.params.reference,
        status: 'confirmed'
      }, { new: true });
      orderNumber = order?.orderNumber;
    }

    res.json({
      ...data.data,
      orderNumber
    });
  } catch (error) {
    console.error('Paystack verify error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook handler
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    if (!PAYSTACK_SECRET) {
      return res.status(500).json({ error: 'Paystack secret key not configured' });
    }

    const hash = crypto
      .createHmac('sha512', PAYSTACK_SECRET)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = req.body;

    if (event.event === 'charge.success') {
      const { reference, metadata } = event.data;

      if (metadata?.orderId) {
        const order = await Order.findByIdAndUpdate(metadata.orderId, {
          paymentStatus: 'paid',
          paymentReference: reference,
          status: 'confirmed'
        }, { new: true }).populate('items.product');

        if (order && metadata?.userId) {
          const user = await User.findById(metadata.userId);
          if (user) {
            try {
              await sendOrderConfirmationEmail(order, user);
            } catch (emailError) {
              console.error('Failed to send order confirmation email:', emailError);
            }
          }
        }
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
