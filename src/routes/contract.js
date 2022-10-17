const express = require('express')
const { Op } = require('sequelize')
const { TERMINATED } = require('../enums/contract-status')
const { getProfile } = require('../middleware/getProfile')
const router = express.Router()

router.get('/:id', getProfile, async (req, res) => {
  const { Contract } = req.app.get('models')
  const id = req.params.id
  const contract = await Contract.findOne({
    where: {
      id,
      [Op.or]: [
        {
          contractorId: req.profile.id
        },
        {
          clientId: req.profile.id
        }
      ]
    }
  })
  if (!contract) return res.status(404).end()
  res.json(contract)
})

router.get('/', getProfile, async (req, res) => {
  const { Contract } = req.app.get('models')
  const contracts = await Contract.findAll({
    where: {
      status: {
        [Op.ne]: TERMINATED
      },
      [Op.or]: [
        {
          contractorId: req.profile.id
        },
        {
          clientId: req.profile.id
        }
      ]
    }
  })
  res.json(contracts)
})
module.exports = router
