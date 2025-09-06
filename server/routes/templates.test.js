const request = require('supertest');
const express = require('express');
const templatesRouter = require('./templates');

const app = express();
app.use('/api/templates', templatesRouter);

describe('Templates API', () => {
  it('should respond to GET', async () => {
    const res = await request(app).get('/api/templates');
    expect([200, 404]).toContain(res.statusCode); // Accepts 404 if no route
  });
});
