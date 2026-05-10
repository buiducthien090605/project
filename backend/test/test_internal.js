
import http from 'k6/http';

export const options = {
  // stages: [
  //   { duration: '10s', target: 10 },  
  //   { duration: '20s', target: 40 },  
  //   { duration: '30s', target: 100 },  
  //   { duration: '20s', target: 40 },  
  //   { duration: '10s', target: 0 },    
  // ],

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

export default function () {
  // const url = 'http://localhost:3002/api/orders';
  const url = 'http://order-service:3002/api/orders';

  const payload = JSON.stringify({
    items: [
      {
        product_id: '69c2680936d054e0750170a0',
        quantity: 1
      }
    ]
  });

  http.post(url, payload, {
    headers: { 'Content-Type': 'application/json' },
  });
}
