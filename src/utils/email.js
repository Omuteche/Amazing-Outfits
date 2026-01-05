const sgMail = require('@sendgrid/mail');

// Set SendGrid API key
if (!process.env.SENDGRID_API_KEY) {
  console.error('EMAIL TRAP: SENDGRID_API_KEY environment variable is not set');
} else {
  console.log('EMAIL TRAP: SENDGRID_API_KEY is set');
}
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

if (!process.env.FROM_EMAIL) {
  console.error('EMAIL TRAP: FROM_EMAIL environment variable is not set');
} else {
  console.log('EMAIL TRAP: FROM_EMAIL is set');
}

/**
 * Send order confirmation email to customer
 * @param {Object} order - The order object
 * @param {Object} user - The user object
 */
const sendOrderConfirmationEmail = async (order, user) => {
  console.log('EMAIL TRAP: sendOrderConfirmationEmail called with order:', order._id, 'user:', user.email);
  try {
    console.log('EMAIL TRAP: Preparing order items for email...');
    const orderItems = order.items.map(item =>
      `${item.quantity}x ${item.product.name} - ₦${item.price * item.quantity}`
    ).join('\n');

    console.log('EMAIL TRAP: Constructing email message...');
    const msg = {
      to: user.email,
      from: process.env.FROM_EMAIL,
      subject: `Order Confirmation - Order #${order._id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Order Confirmation</h2>
          <p>Dear ${user.name},</p>
          <p>Thank you for your order! Here are the details:</p>

          <div style="background-color: #f9f9f9; padding: 20px; margin: 20px 0;">
            <h3>Order Details</h3>
            <p><strong>Order ID:</strong> ${order._id}</p>
            <p><strong>Total Amount:</strong> ₦${order.totalAmount}</p>
            <p><strong>Status:</strong> ${order.status}</p>
          </div>

          <div style="background-color: #f9f9f9; padding: 20px; margin: 20px 0;">
            <h3>Items Ordered</h3>
            <pre style="white-space: pre-line;">${orderItems}</pre>
          </div>

          <div style="background-color: #f9f9f9; padding: 20px; margin: 20px 0;">
            <h3>Shipping Address</h3>
            <p>${order.shippingAddress.street}</p>
            <p>${order.shippingAddress.city}, ${order.shippingAddress.state}</p>
            <p>${order.shippingAddress.country} ${order.shippingAddress.postalCode}</p>
          </div>

          <p>If you have any questions, please contact our support team.</p>
          <p>Best regards,<br>Amazing Outfits Team</p>
        </div>
      `,
    };

    console.log('EMAIL TRAP: Sending email via SendGrid...');
    await sgMail.send(msg);
    console.log(`EMAIL TRAP: Order confirmation email sent successfully to ${user.email}`);
  } catch (error) {
    console.error('EMAIL TRAP: Error sending order confirmation email:', error.message);
    console.error('EMAIL TRAP: Full error details:', error);
    if (error.response) {
      console.error('EMAIL TRAP: SendGrid response error:', error.response.body);
    }
    throw error;
  }
};

/**
 * Send order status update email to customer
 * @param {Object} order - The order object
 * @param {Object} user - The user object
 */
const sendOrderStatusUpdateEmail = async (order, user) => {
  console.log('EMAIL TRAP: sendOrderStatusUpdateEmail called with order:', order._id, 'user:', user.email, 'status:', order.status);
  try {
    console.log('EMAIL TRAP: Preparing order items for status update email...');
    const orderItems = order.items.map(item =>
      `${item.quantity}x ${item.productName} - ₦${item.price * item.quantity}`
    ).join('\n');

    console.log('EMAIL TRAP: Constructing status update email message...');
    const msg = {
      to: user.email,
      from: process.env.FROM_EMAIL,
      subject: `Order Status Update - Order #${order.orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Order Status Update</h2>
          <p>Dear ${user.fullName},</p>
          <p>Your order status has been updated. Here are the details:</p>

          <div style="background-color: #f9f9f9; padding: 20px; margin: 20px 0;">
            <h3>Order Details</h3>
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Status:</strong> ${order.status}</p>
            <p><strong>Total Amount:</strong> ₦${order.total}</p>
          </div>

          <div style="background-color: #f9f9f9; padding: 20px; margin: 20px 0;">
            <h3>Items Ordered</h3>
            <pre style="white-space: pre-line;">${orderItems}</pre>
          </div>

          <div style="background-color: #f9f9f9; padding: 20px; margin: 20px 0;">
            <h3>Shipping Address</h3>
            <p>${order.shippingAddress?.fullName}</p>
            <p>${order.shippingAddress?.addressLine1}</p>
            <p>${order.shippingAddress?.city}, ${order.shippingAddress?.county}</p>
            <p>${order.shippingAddress?.phone}</p>
          </div>

          <p>If you have any questions, please contact our support team.</p>
          <p>Best regards,<br>Amazing Outfits Team</p>
        </div>
      `,
    };

    console.log('EMAIL TRAP: Sending status update email via SendGrid...');
    await sgMail.send(msg);
    console.log(`EMAIL TRAP: Order status update email sent successfully to ${user.email} for order ${order.orderNumber}`);
  } catch (error) {
    console.error('EMAIL TRAP: Error sending order status update email:', error.message);
    console.error('EMAIL TRAP: Full error details:', error);
    if (error.response) {
      console.error('EMAIL TRAP: SendGrid response error:', error.response.body);
    }
    throw error;
  }
};

module.exports = {
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail,
};
