const express = require('express')
const router = express.Router()

const ChatController = require('../controller/ChatController');

router.route("/").post(ChatController.getChat).get(ChatController.getChats);
router.route("/createGroup").post(ChatController.createGroup);
router.route("/renameGroup").patch(ChatController.renameGroup);
router.route("/removeFromGroup").patch(ChatController.removeFromGroup);
router.route("/addUserToGroup").patch(ChatController.addUserToGroup);

module.exports = router