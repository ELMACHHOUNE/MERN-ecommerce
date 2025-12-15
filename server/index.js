// Vercel entrypoint for the API (Serverless Function handler)
// Export the Express app; Vercel will invoke it as a handler
const app = require("./app");

module.exports = app;
