const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.post("/add", async (req, res) => {
    try {
        const user = await User.create(req.body);
        res.json(user);
    } catch (error) {
        res.status(500).json(error);
    }
});

module.exports = router;