/**
 * User Routes
 * Routes for user-related operations
 */

const express = require("express");
const router = express.Router();
const { seedDummyData } = require("../controllers/userController");
const { validateRequired } = require("../middleware/validator");
const { asyncHandler } = require("../middleware/errorHandler");

// Seed dummy data endpoint
router.post(
  "/seed/dummy-data",
  validateRequired(["userId"]),
  asyncHandler(seedDummyData)
);

module.exports = router;

