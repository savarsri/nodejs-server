const express = require('express')
const router = express.Router()

const MessageController = require('../controller/MessageController');

router.get("/:chatId", MessageController.allMessages);
router.post('/', MessageController.sendMessage);

module.exports = router