const amqp = require("amqplib");
const Inventory = require("../models/Inventory");

async function initRabbitMQConsumer() {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL || "amqp://rabbitmq:5672");
        const channel = await connection.createChannel();
        const queue = "order_processing_queue";

        await channel.assertQueue(queue, { durable: true });
        console.log(`[Inventory Worker] Listening to queue: ${queue}`);

        channel.consume(queue, async (msg) => {
            if (msg !== null) {
                const eventData = JSON.parse(msg.content.toString());
                console.log(`[Inventory Worker] Received order: ${eventData.orderId}`);

                try {
                    for (let item of eventData.items) {
                        await Inventory.findOneAndUpdate(
                            { product_id: item.product_id },
                            { $inc: { stock: -item.quantity } },
                            { upsert: true, new: true }
                        );
                    }
                    console.log(`[Inventory Worker] Stock updated for order: ${eventData.orderId}`);
                    
                    channel.ack(msg);
                } catch (err) {
                    console.error(`[Inventory Worker] Stock error:`, err.message);
                }
            }
        });
    } catch (error) {
        console.error("[Inventory Worker] RabbitMQ connection error. Retrying in 5s...", error.message);
        setTimeout(initRabbitMQConsumer, 5000);
    }
}

module.exports = initRabbitMQConsumer;
