const express = require('express');
const { getAvailability, bookMeeting } = require("../controllers/bookingsController.js"); 

const router = express.Router();

router.post("/availability", getAvailability);
router.post("/book", bookMeeting);

module.exports = router;