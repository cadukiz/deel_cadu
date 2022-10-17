const express = require('express')
const AdminController = require('../controllers/admin')
const router = express.Router()
const adminController = new AdminController()

router.get('/best-profession', adminController.bestProfession)

router.get('/best-contractors', adminController.bestContractors)

router.get('/best-clients', adminController.bestClients)

router.post('/balances/deposit/:userId', adminController.clientDeposit)

module.exports = router
