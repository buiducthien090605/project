const express = require("express")
const router = express.Router()
const Inventory = require("../models/Inventory")

/**
 * @swagger
 * /api/inventory:
 *   post:
 *     summary: Tạo mới kho hàng cho một sản phẩm
 *     tags: [Inventory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product_id:
 *                 type: string
 *               stock:
 *                 type: number
 *     responses:
 *       201:
 *         description: Khởi tạo kho hàng thành công
 */
router.post("/", async (req, res) => {
    try {
        const item = await Inventory.create(req.body)
        res.status(201).json(item)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

router.get("/:product_id", async (req, res) => {
    try {
        const item = await Inventory.findOne({
            product_id: req.params.product_id
        })

        if (!item) {
            return res.status(404).json({ message: "Item not found" })
        }

        res.status(200).json(item)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

router.post("/increase", async (req, res) => {
    try {
        const { product_id, quantity } = req.body

        const item = await Inventory.findOneAndUpdate(
            { product_id },
            { $inc: { stock: quantity } },
            { new: true }
        )

        if (!item) {
            return res.status(404).json({ message: "Item not found" })
        }

        res.status(200).json(item)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

router.post("/decrease", async (req, res) => {
    try {
        const { product_id, quantity } = req.body

        const item = await Inventory.findOne({ product_id })

        if (!item) {
            return res.status(404).json({ message: "Item not found" })
        }

        if (item.stock < quantity) {
            return res.status(400).json({ message: "Not enough stock" })
        }

        item.stock -= quantity
        await item.save()

        res.status(200).json(item)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

/**
 * @swagger
 * /api/inventory:
 *   get:
 *     summary: Lấy toàn bộ danh sách kho hàng
 *     tags: [Inventory]
 *     responses:
 *       200:
 *         description: Trả về danh sách tồn kho
 */
router.get("/", async (req, res) => {
    try {
        const items = await Inventory.find()

        res.status(200).json(items)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

module.exports = router
