const express = require('express')
const ContractController = require('../controllers/contract')
const { getProfile } = require('../middleware/getProfile')
const router = express.Router()

const contractController = new ContractController()

router.get('/:id', getProfile, contractController.show)
router.get('/', getProfile, contractController.index)

module.exports = router
