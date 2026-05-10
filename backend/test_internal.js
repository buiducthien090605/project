import http from 'k6/http';
import { Trend } from 'k6/metrics';

export const options = {
  stages: [
    { duration: '15s', target: 20 },
    { duration: '15s', target: 40 },
    { duration: '15s', target: 0 },
  ],
};

const duration = new Trend('response_time');

export default function () {
  const res = http.post('http://10.96.74.181:3002/api/orders', JSON.stringify({
    items: [{ product_id: '69c2680936d054e0750170a0', quantity: 1 }]
  }), { headers: { 'Content-Type': 'application/json' } });
  if (res.status === 201) {
    duration.add(Date.now() - __ITER * 1000);
  }
}
