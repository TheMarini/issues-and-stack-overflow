// -- Requires --
require('dotenv').config();
const Factory = require('./src/factory');

// -- Configuration --
// GitHub API token
const token = process.env.TOKEN;
// Quantity of pages as objective
const pages = 25;
// Quantity of results by page | Default: 5
const pageLength = 4;

// New factory to mine
const factory = new Factory(token, pages, pageLength);

// Start to mine
factory.start().then(() => {
  // The end
  process.exit();
});
