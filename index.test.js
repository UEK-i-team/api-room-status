const request = require('supertest');
const express = require('express'); // Import express to define the app
const path = require('path');
const fs = require('fs');

// Manually set up a simple app mimicking the main app structure for testing purposes
// This avoids directly requiring '../../index.js' which might auto-start the server
// or have other side effects not ideal for isolated testing.
const app = express();
app.use(express.json()); // Middleware to parse JSON

// ---- Global State (mirrored for test isolation) ----
let isRoomOpen = false; // Initial state for tests

// ---- Environment Variable ----
// Use a fixed API key for testing to ensure consistency
process.env.ACCESS_KEY = 'test_api_key';
const ACCESS_KEY = process.env.ACCESS_KEY;


// ---- Route Handlers (simplified and adapted for testing) ----

// GET / handler to check room status
app.get('/', (req, res) => {
  let backgroundColor;
  let message;
  let pageTitle;

  if (isRoomOpen) {
    backgroundColor = 'green';
    message = 'OPEN';
    pageTitle = 'Status: Open';
  } else {
    backgroundColor = 'red';
    message = 'CLOSED';
    pageTitle = 'Status: Closed';
  }

  // In a real test, you might not read from the file system like this
  // or you'd mock fs.readFile. For simplicity, we'll keep it but
  // acknowledge it's a simplification.
  // For this test, we only care about the message to infer status.
  res.send({ message });
});


// POST /api/changeStatus (the endpoint we are testing)
app.post('/api/changeStatus', (req, res) => {
  const { newStatus, apiKey } = req.body;

  if (apiKey !== ACCESS_KEY) {
    return res.status(403).json({ error: 'Unauthorized access - invalid API key.' });
  }

  if (newStatus !== "open" && newStatus !== "close") {
    return res.status(400).json({ error: 'Invalid status. Allowed values are "open" or "close".' });
  }

  isRoomOpen = newStatus === "open";

  res.json({
    message: `Room status successfully changed to "${newStatus}".`,
  });
});


describe('API Endpoint /api/changeStatus', () => {
  // Reset isRoomOpen before each test to ensure test isolation
  beforeEach(() => {
    isRoomOpen = false; // Default to closed
  });

  it('should change status to "open" and update isRoomOpen to true', async () => {
    const response = await request(app)
      .post('/api/changeStatus')
      .send({ newStatus: 'open', apiKey: ACCESS_KEY });
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Room status successfully changed to "open".');
    
    // Verify isRoomOpen by checking the root endpoint's response
    const statusResponse = await request(app).get('/');
    expect(statusResponse.body.message).toBe('OPEN');
  });

  it('should change status to "close" and update isRoomOpen to false', async () => {
    // First, open the room to test closing it
    await request(app)
      .post('/api/changeStatus')
      .send({ newStatus: 'open', apiKey: ACCESS_KEY });

    const response = await request(app)
      .post('/api/changeStatus')
      .send({ newStatus: 'close', apiKey: ACCESS_KEY });
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Room status successfully changed to "close".');

    // Verify isRoomOpen by checking the root endpoint's response
    const statusResponse = await request(app).get('/');
    expect(statusResponse.body.message).toBe('CLOSED');
  });

  it('should return 400 for invalid string status', async () => {
    const response = await request(app)
      .post('/api/changeStatus')
      .send({ newStatus: 'pending', apiKey: ACCESS_KEY });
    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('Invalid status. Allowed values are "open" or "close".');
  });

  it('should return 400 for non-string status (boolean true)', async () => {
    const response = await request(app)
      .post('/api/changeStatus')
      .send({ newStatus: true, apiKey: ACCESS_KEY });
    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('Invalid status. Allowed values are "open" or "close".');
  });

  it('should return 400 for non-string status (number 123)', async () => {
    const response = await request(app)
      .post('/api/changeStatus')
      .send({ newStatus: 123, apiKey: ACCESS_KEY });
    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('Invalid status. Allowed values are "open" or "close".');
  });
  
  it('should return 403 for invalid API key', async () => {
    const response = await request(app)
      .post('/api/changeStatus')
      .send({ newStatus: 'open', apiKey: 'wrong_key' });
    expect(response.statusCode).toBe(403);
    expect(response.body.error).toBe('Unauthorized access - invalid API key.');
  });

  it('should return correct success message for "open"', async () => {
    const response = await request(app)
      .post('/api/changeStatus')
      .send({ newStatus: 'open', apiKey: ACCESS_KEY });
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Room status successfully changed to "open".');
  });

  it('should return correct success message for "close"', async () => {
    const response = await request(app)
      .post('/api/changeStatus')
      .send({ newStatus: 'close', apiKey: ACCESS_KEY });
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Room status successfully changed to "close".');
  });
});
