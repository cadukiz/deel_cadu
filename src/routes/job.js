const express = require('express')
const JobController = require('../controllers/job')
const { getProfile } = require('../middleware/getProfile')
const router = express.Router()
const jobController = new JobController()

router.get('/', getProfile, jobController.index)

router.get('/unpaid', getProfile, jobController.unpaid)

router.post('/:job_id/pay', getProfile, jobController.pay)

module.exports = router
