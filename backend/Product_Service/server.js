// CI Path-Trigger Verification: Product Service (Subsequent Push Test)
require("./tracing");
require("dotenv").config()
const express = require("express")
const cors = require("cors")
const connectDB = require("./config/db")

const swaggerUI = require("swagger-ui-express")
const swaggerJsDoc = require("swagger-jsdoc")

const app = express()
app.use(cors())
app.use(express.json())

connectDB()

const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Product Service API",
            version: "1.0.0",
            description: "API Documentation for E-Commerce Product Service",
        },
        servers: [
            {
                url: "http://localhost:3001",
                description: "Local K8s/Docker Server"
            }
        ],
    },
    apis: ["./routes/*.js"],
};
const swaggerSpecs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpecs));

app.use("/api/products", require("./routes/productRoutes"))
const port = process.env.PORT || 3001
app.listen(port, () => {
    console.log(`Product Service runing on port ${port}`)
    console.log(`Swagger Docs available at http://localhost:${port}/api-docs`)
    console.log("Product Service: CI Path triggers verification - 2/3 modified!")
})