const express = require('express')
const ProfileController = require('../controllers/profile')
const { getProfile } = require('../middleware/getProfile')
const router = express.Router()

const profileController = new ProfileController()

router.get('/:id', getProfile, profileController.index)
module.exports = router
