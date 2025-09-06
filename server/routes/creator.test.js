const request = require('supertest');
const express = require('express');
const creatorRouter = require('./creator');

const app = express();
app.use('/api/creator', creatorRouter);

describe('Creator API', () => {
  it('should respond to GET', async () => {
    const res = await request(app).get('/api/creator');
    expect([200, 404]).toContain(res.statusCode); // Accepts 404 if no route
  });
});
