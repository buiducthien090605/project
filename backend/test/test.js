import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },
    { duration: '1m', target: 200 },
    { duration: '2m', target: 1000 },
    { duration: '1m', target: 200 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.05'],
  },
};

export default function () {
  const ORDER_URL = 'http://localhost:3002/api/orders';

  let payload = JSON.stringify({
    productId: 'random-product-id',
    quantity: 1,
    userId: 'user-' + Math.floor(Math.random() * 10000)
  });

  let params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  let orderRes = http.post(ORDER_URL, payload, params);
  check(orderRes, {
    'status 200/201': (r) => r.status === 200 || r.status === 201,
  });

  sleep(1);
}
