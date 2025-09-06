

const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
jest.mock('../config/database');
jest.mock('../utils/email');
jest.mock('jsonwebtoken', () => ({ sign: () => 'mock-jwt-token' }));
const { query } = require('../config/database');
const { sendVerificationEmail } = require('../utils/email');

let app;
let createAuthRouter;
function setupApp(options = {}) {
  createAuthRouter = require('./auth');
  app = express();
  app.use(bodyParser.json());
  app.use('/api/auth', createAuthRouter(options));
}



describe('Auth API', () => {
  let originalVerifyPassword;
  beforeAll(() => {
    originalVerifyPassword = require('../utils/encryption').verifyPassword;
  });
  afterAll(() => {
    require('../utils/encryption').verifyPassword = originalVerifyPassword;
  });
  beforeEach(() => {
    jest.clearAllMocks();
    // Always mock verifyPassword to true by default, can override in test
    require('../utils/encryption').verifyPassword = () => true;
    // Clear require cache for router
    delete require.cache[require.resolve('./auth')];
    setupApp({ verifyPassword: require('../utils/encryption').verifyPassword });
  });

  it('registers a new user successfully', async () => {
    // No existing user
    query.mockImplementationOnce(() => Promise.resolve({ rows: [] }))
      // Insert user
      .mockImplementationOnce(() => Promise.resolve({ rows: [{ id: 1, email: 'test@example.com', username: 'testuser', is_verified: false }] }));
    sendVerificationEmail.mockResolvedValue({});
    process.env.JWT_SECRET = 'test';
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', username: 'testuser', password: 'Password1', confirmPassword: 'Password1' });
    expect(res.statusCode).toBe(201);
    expect(res.body.user.email).toBe('test@example.com');
    expect(sendVerificationEmail).toHaveBeenCalled();
    expect(res.body.token).toBe('mock-jwt-token');
  });

  it('rejects registration with existing user', async () => {
    query.mockImplementationOnce(() => Promise.resolve({ rows: [{ id: 1 }] }));
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', username: 'testuser', password: 'Password1', confirmPassword: 'Password1' });
    expect(res.statusCode).toBe(409);
  expect(res.body.error).toBeDefined();
  expect(res.body.code).toBeDefined();
  expect(res.body.timestamp).toBeDefined();
  });

  it('rejects registration with invalid input', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'bad', username: '', password: '123', confirmPassword: '456' });
    expect(res.statusCode).toBe(400);
  expect(res.body.error).toBeDefined();
  expect(res.body.code).toBeDefined();
  expect(res.body.timestamp).toBeDefined();
  });

  it('handles registration server error', async () => {
    query.mockImplementationOnce(() => { throw new Error('DB error'); });
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', username: 'testuser', password: 'Password1', confirmPassword: 'Password1' });
    expect(res.statusCode).toBe(500);
  expect(res.body.error).toBeDefined();
  expect(res.body.code).toBeDefined();
  expect(res.body.timestamp).toBeDefined();
  });



  it('logs in successfully with valid credentials', async () => {
    query.mockReset();
    query.mockImplementationOnce(() => Promise.resolve({ rows: [{ id: 1, email: 'test@example.com', username: 'testuser', password_hash: 'hashed', is_verified: true }] }))
      .mockImplementationOnce(() => Promise.resolve({ rows: [] })); // For last_login update
    // verifyPassword is mocked to true by default in beforeEach
    process.env.JWT_SECRET = 'test';
    setupApp();
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'Password1' });
    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBe('test@example.com');
    expect(res.body.token).toBe('mock-jwt-token');
  });


  it('rejects login with wrong password', async () => {
    query.mockReset();
    query.mockImplementationOnce(() => Promise.resolve({ rows: [{ id: 1, email: 'test@example.com', username: 'testuser', password_hash: 'hashed', is_verified: true }] }));
    // Inject a verifyPassword mock that always returns false
    delete require.cache[require.resolve('./auth')];
    setupApp({ verifyPassword: () => false });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'wrong' });
    expect(res.statusCode).toBe(401);
  expect(res.body.error).toBeDefined();
  expect(res.body.code).toBeDefined();
  expect(res.body.timestamp).toBeDefined();
  });


  it('rejects login with non-existent user', async () => {
    query.mockReset();
    query.mockImplementationOnce(() => Promise.resolve({ rows: [] }));
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nouser@example.com', password: 'Password1' });
    expect(res.statusCode).toBe(401);
  expect(res.body.error).toBeDefined();
  expect(res.body.code).toBeDefined();
  expect(res.body.timestamp).toBeDefined();
  });


  it('rejects login with invalid input', async () => {
    query.mockReset();
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'bad', password: '' });
    expect(res.statusCode).toBe(400);
  expect(res.body.error).toBeDefined();
  expect(res.body.code).toBeDefined();
  expect(res.body.timestamp).toBeDefined();
  });


  it('handles login server error', async () => {
    query.mockReset();
    query.mockImplementationOnce(() => { throw new Error('DB error'); });
    require('../utils/encryption').verifyPassword = originalVerifyPassword;
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'Password1' });
    expect(res.statusCode).toBe(500);
  expect(res.body.error).toBeDefined();
  expect(res.body.code).toBeDefined();
  expect(res.body.timestamp).toBeDefined();
  });

  // Email verification edge cases

  it('verifies email with valid token', async () => {
    query.mockReset();
    query.mockImplementationOnce(() => Promise.resolve({ rows: [{ id: 1, email: 'test@example.com', verification_expiry: new Date(Date.now() + 10000) }] }))
      .mockImplementationOnce(() => Promise.resolve({ rows: [] })); // For update
    const res = await request(app).get('/api/auth/verify/validtoken');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Email verified successfully');
  });


  it('rejects email verification with expired token', async () => {
    query.mockReset();
    query.mockImplementationOnce(() => Promise.resolve({ rows: [{ id: 1, email: 'test@example.com', verification_expiry: new Date(Date.now() - 10000) }] }));
    const res = await request(app).get('/api/auth/verify/expiredtoken');
    expect(res.statusCode).toBe(400);
  expect(res.body.error).toBeDefined();
  expect(res.body.code).toBeDefined();
  expect(res.body.timestamp).toBeDefined();
  });


  it('rejects email verification with invalid token', async () => {
    query.mockReset();
    query.mockImplementationOnce(() => Promise.resolve({ rows: [] }));
    const res = await request(app).get('/api/auth/verify/invalidtoken');
    expect(res.statusCode).toBe(400);
  expect(res.body.error).toBeDefined();
  expect(res.body.code).toBeDefined();
  expect(res.body.timestamp).toBeDefined();
  });

  // Add similar deep tests for password reset endpoints if implemented
});
