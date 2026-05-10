const express = require("express")
const Product = require("../models/Product.js")
const router = express.Router()

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Tạo một sản phẩm mới
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Sản phẩm được tạo thành công
 */
router.post("/", async (req, res) => {
    try {
        const product = await Product.create(req.body)
        res.status(201).json(product)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

const os = require("os");

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Lấy danh sách tất cả sản phẩm
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Danh sách sản phẩm trả về thành công
 */
router.get("/", async (req, res) => {
    try {
        const products = await Product.find();

        res.status(200).json({
            server: os.hostname(),
            pid: process.pid,
            time: new Date().toISOString(),
            data: products
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)

        if (!product) {
            return res.status(404).json({ message: "Product not found" })
        }

        res.status(200).json(product)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

router.put("/:id", async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true } 
        )

        if (!product) {
            return res.status(404).json({ message: "Product not found" })
        }

        res.status(200).json(product)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

router.delete("/:id", async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id)

        if (!product) {
            return res.status(404).json({ message: "Product not found" })
        }

        res.status(200).json({ message: "Product deleted" })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

router.get("/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        server: require("os").hostname(),
        time: new Date()
    });
});

module.exports = router
