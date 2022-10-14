const express = require('express')
const bodyParser = require('body-parser')
const { sequelize } = require('./models')
const { getProfile } = require('./middleware/getProfile')
const { Op } = require('sequelize')

const app = express()
app.use(bodyParser.json())
app.set('sequelize', sequelize)
app.set('models', sequelize.models)

/**
 * FIX ME!
 * @returns contract by id
 */
app.get('/contracts/:id', getProfile, async (req, res) => {
  const { Contract } = req.app.get('models')
  const id = req.params.id
  const contract = await Contract.findOne({
    where: {
      id,
      [Op.or]: [
        {
          ContractorId: req.profile.id
        },
        {
          ClientId: req.profile.id
        }
      ]
    }
  })
  if (!contract) return res.status(404).end()
  res.json(contract)
})

app.get('/contracts', getProfile, async (req, res) => {
  const { Contract } = req.app.get('models')
  const contracts = await Contract.findAll({
    where: {
      status: {
        [Op.ne]: 'terminated'
      },
      [Op.or]: [
        {
          ContractorId: req.profile.id
        },
        {
          ClientId: req.profile.id
        }
      ]
    }
  })
  res.json(contracts)
})

app.get('/jobs/unpaid', getProfile, async (req, res) => {
  const { Job, Contract } = req.app.get('models')
  const jobs = await Job.findAll({
    where: {
      paid: {
        [Op.is]: null
      }
    },
    include: {
      model: Contract,
      where: {
        status: 'in_progress',
        [Op.or]: [
          {
            ContractorId: req.profile.id
          },
          {
            ClientId: req.profile.id
          }
        ]
      }
    }
  })
  res.json(jobs)
})

module.exports = app
