const express = require('express')
const router = express.Router()

const ChatController = require('../controller/ChatController');

router.post('/chat', ChatController.getChat);
router.post('/chats', ChatController.getChats);
router.post('/createGroup', ChatController.createGroup);
router.patch('/renameGroup', ChatController.renameGroup);
router.patch('/removeFromGroup', ChatController.removeFromGroup);
router.patch('/addUserToGroup', ChatController.addUserToGroup);

module.exports = router