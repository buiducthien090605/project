const express = require("express");
const axios = require("axios");
const router = express.Router();
const Order = require("../models/Order");

const PRODUCT_SERVICE = process.env.PRODUCT_SERVICE_URL || "http://product-service:3001";

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Tạo một đơn hàng mới (và bắn event sang RabbitMQ)
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product_id:
 *                       type: string
 *                     quantity:
 *                       type: number
 *     responses:
 *       202:
 *         description: Đơn hàng tạo thành công, đang xử lý kho (RabbitMQ)
 *       404:
 *         description: Không tìm thấy sản phẩm
 */
router.post("/", async (req, res) => {
  try {
    const { items } = req.body;
    let total_price = 0;
    let orderItems = [];

    for (let item of items) {
      try {
        const productRes = await axios.get(`${PRODUCT_SERVICE}/api/products/${item.product_id}`);
        const product = productRes.data;
        
        total_price += product.price * item.quantity;
        orderItems.push({
          product_id: item.product_id,
          quantity: item.quantity,
          price: product.price,
        });
      } catch (err) {
        return res.status(404).json({ message: `Product ${item.product_id} not found!` });
      }
    }

    const order = await Order.create({
      items: orderItems,
      total_price,
      status: "PENDING"
    });

    const channel = req.app.locals.rabbitChannel;
    if (channel) {
        const eventData = JSON.stringify({ 
            orderId: order._id, 
            items: orderItems 
        });
        channel.sendToQueue("order_processing_queue", Buffer.from(eventData));
        console.log(`[Message Queue] Order event sent: ${order._id}`);
    } else {
        console.warn("Warning: RabbitMQ not connected, order stock not processed!");
    }

    res.status(202).json({
        message: "Order created! Processing stock...",
        order: order
    });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Lấy danh sách tất cả các đơn hàng
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Trả về danh sách đơn hàng
 */
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: "Error fetching orders", error: err.message });
  }
});

module.exports = router;
