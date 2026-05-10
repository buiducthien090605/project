import http from 'k6/http';
import { Counter, Trend } from 'k6/metrics';

export const options = {
  stages: [
    { duration: '10s', target: 20 },
    { duration: '10s', target: 200 },
    { duration: '20s', target: 300 },
    { duration: '10s', target: 50 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<1500'],
    http_req_failed: ['rate<0.1'],
  },
};

const orderCreated = new Counter('order_created');
const requestDuration = new Trend('request_duration');

export default function () {
  const url = 'http://order-service:3002/api/orders';

  const payload = JSON.stringify({
    items: [
      {
        product_id: '69c2680936d054e0750170a0',
        quantity: 1
      }
    ]
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const start = Date.now();
  const res = http.post(url, payload, params);
  const duration = Date.now() - start;

  requestDuration.add(duration);

  if (res.status === 201 || res.status === 200) {
    orderCreated.add(1);
  }
}
