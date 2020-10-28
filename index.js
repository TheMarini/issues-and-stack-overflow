// -- Requires --
require('dotenv').config();
const Factory = require('./src/factory');

// -- Configuration --
// GitHub API token
const token = process.env.TOKEN;
// Quantity of pages as objective (5 at time)
const pages = 20;

// New factory to mine
const pythonFactory = new Factory(token, pages, 'python');

// Start to mine
pythonFactory.start().then(() => {
  const javaFactory = new Factory(token, pages, 'java');

  javaFactory.start().then(() => {
    // The end
    process.exit();
  });
});
