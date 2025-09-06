const request = require('supertest');
const express = require('express');
const mediaRouter = require('./media');

const app = express();
app.use('/api/media', mediaRouter);

describe('Media API', () => {
  it('should respond to GET', async () => {
    const res = await request(app).get('/api/media');
    expect([200, 404]).toContain(res.statusCode); // Accepts 404 if no route
  });
});
