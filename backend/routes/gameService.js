const express = require('express');
const { checkUser } = require('../controllers/gameService');

const router = express.Router();

router.post('/check-user', checkUser);

module.exports = router;
