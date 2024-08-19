// app/backend/__tests__/server.test.js
const request = require('supertest');
const app = require('../server'); // Export your Express app in server.js

// just display a message
describe('GET /', () => {
  it('responds with "Hello World!"', (done) => {
    request(app).get('/').expect('Hello World!', done);
  });
});
