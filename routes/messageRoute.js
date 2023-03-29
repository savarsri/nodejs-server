const express = require('express')
const router = express.Router()

const MessageController = require('../controller/MessageController');

router.route("/:chatId").get(MessageController.allMessages);
router.route("/").post(MessageController.sendMessage);

module.exports = router