/**
 * User Routes
 * Routes for user-related operations
 */

const express = require("express");
const router = express.Router();
const { seedDummyData } = require("../controllers/userController");

// Seed dummy data endpoint
router.post("/seed/dummy-data", seedDummyData);

module.exports = router;

