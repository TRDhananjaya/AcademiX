const express = require("express");

const router = express.Router();

router.use("/users", require("./UserRoutes"));
router.use("/health", require("./HealthRoutes"));

module.exports = router;
