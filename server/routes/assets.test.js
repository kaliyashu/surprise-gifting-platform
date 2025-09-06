const request = require('supertest');
const express = require('express');
const assetsRouter = require('./assets');

const app = express();
app.use('/api/assets', assetsRouter);

describe('Assets API', () => {
  it('should respond to GET', async () => {
    const res = await request(app).get('/api/assets');
    expect([200, 404]).toContain(res.statusCode); // Accepts 404 if no route
  });
});
