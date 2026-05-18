// CI Path-Trigger Verification: Order Service
require("./tracing");
require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const amqp = require("amqplib");

const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");

const app = express();
app.use(express.json());

connectDB();

let channel;
async function connectRabbitMQ() {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL || "amqp://rabbitmq:5672");
        channel = await connection.createChannel();
        await channel.assertQueue("order_processing_queue", { durable: true });
        
        app.locals.rabbitChannel = channel; 
        console.log("RabbitMQ Connected - Ready to publish events");
    } catch (error) {
        console.error("RabbitMQ Connection Failed. Retrying in 5s...", error.message);
        setTimeout(connectRabbitMQ, 5000);
    }
}

setTimeout(connectRabbitMQ, 10000);

const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Order Service API",
            version: "1.0.0",
            description: "API Documentation for E-Commerce Order Service",
        },
        servers: [
            {
                url: "http://localhost:3002",
                description: "Local K8s/Docker Server"
            }
        ],
    },
    apis: ["./routes/*.js"],
};
const swaggerSpecs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpecs));

app.use("/api/orders", require("./routes/orderRoutes"));

app.get("/", (req, res) => {
  res.send("Order Service is running");
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Order Service running on port ${PORT}`);
  console.log(`Swagger Docs available at http://localhost:${PORT}/api-docs`);
  console.log("Order Service: CI Path triggers verification - All 3 modified!");
});
