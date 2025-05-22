// ---- Imports and Initial Setup ----
const express = require('express');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const ACCESS_KEY = process.env.ACCESS_KEY;

// ---- Global State ----
let isRoomOpen = false;

// ---- Middleware ----
// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
// Parse JSON request bodies
app.use(express.json());
// Middleware for handling CORS (allowing all origins)
// Note: This is a permissive CORS configuration. For production environments,
// consider restricting Access-Control-Allow-Origin to specific domains
// for enhanced security. Example: res.header("Access-Control-Allow-Origin", "https://your-frontend-domain.com");
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json({});
  }
  next();
});

// ---- Route Handlers ----

/**
 * @route GET /
 * @description Serves the main status page.
 * Reads an HTML template, replaces placeholders with the current room status,
 * and sends the resulting HTML to the client.
 */
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

  fs.readFile(path.join(__dirname, 'views', 'status.html'), 'utf8', (err, htmlTemplate) => {
    if (err) {
      console.error("Error reading HTML file:", err);
      return res.status(500).send("Error loading the page.");
    }

    let htmlContent = htmlTemplate.replace('{pageTitle}', pageTitle);
    htmlContent = htmlContent.replace('{backgroundColor}', backgroundColor);
    htmlContent = htmlContent.replace('{message}', message);

    res.setHeader('Content-Type', 'text/html');
    res.send(htmlContent);
  });
});

/**
 * @route POST /api/changeStatus
 * @description API endpoint to change the room's open/closed status.
 * @param {object} req.body - The request body.
 * @param {boolean} req.body.newStatus - The new status for the room (true for open, false for closed).
 * @param {string} req.body.apiKey - The API key for authorization.
 * @returns {object} JSON response indicating success or failure.
 * Possible responses:
 *  - 200 OK: { message: "Room status successfully changed to 'open'." }
 *  - 400 Bad Request: { error: "Invalid status. Allowed values are true (for open) or false (for close)." }
 *  - 403 Forbidden: { error: "Unauthorized access - invalid API key." }
 */
app.post('/api/changeStatus', (req, res) => {
  const { newStatus, apiKey } = req.body;

  if (apiKey !== ACCESS_KEY) {
    return res.status(403).json({ error: 'Unauthorized access - invalid API key.' });
  }

  if (typeof newStatus !== 'boolean') {
    return res.status(400).json({ error: 'Invalid status. Allowed values are true (for open) or false (for close).' });
  }

  isRoomOpen = newStatus;

  res.json({
    message: `Room status successfully changed to "${isRoomOpen ? 'open' : 'closed'}".`,
  });
});

// ---- Server Initialization ----
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
