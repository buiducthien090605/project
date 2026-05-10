require("./tracing");
require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const initRabbitMQConsumer = require("./services/mqConsumer");

const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");

const app = express();
app.use(express.json());

connectDB();

setTimeout(initRabbitMQConsumer, 10000);

const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Inventory Service API",
            version: "1.0.0",
            description: "API Documentation for E-Commerce Inventory Service",
        },
        servers: [
            {
                url: "http://localhost:3003",
                description: "Local K8s/Docker Server"
            }
        ],
    },
    apis: ["./routes/*.js"],
};
const swaggerSpecs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpecs));

app.use("/api/inventory", require("./routes/inventoryRoutes"));

app.get("/", (req, res) => {
  res.send("Inventory Service is running");
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Inventory Service running on port ${PORT}`);
  console.log(`Swagger Docs available at http://localhost:${PORT}/api-docs`);
});
