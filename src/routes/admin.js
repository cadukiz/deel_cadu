const express = require('express')
const { Op } = require('sequelize')
const { CLIENT } = require('../enums/profile-types')
const { Sequelize } = require('../models')
const router = express.Router()

router.get('/best-profession', async (req, res) => {
  const { Profile, Contract, Job } = req.app.get('models')
  const startDate = new Date(req.query.startDate)
  const endDate = new Date(req.query.endDate)
  endDate.setDate(endDate.getDate() + 1)

  const professions = await Profile.findOne({
    subQuery: false,
    attributes: ['profession', [Sequelize.fn('SUM', Sequelize.col('contractor.jobs.price')), 'sumJobs']],
    include: {
      model: Contract,
      as: 'contractor',
      required: true,
      attributes: [],
      include: {
        model: Job,
        as: 'jobs',
        required: true,
        attributes: [],
        where: {
          paid: true,
          paymentDate: {
            [Op.gte]: startDate,
            [Op.lt]: endDate
          }

        }
      }
    },
    limit: 1,
    group: ['profession'],
    order: [['sumJobs', 'DESC']]
  }

  )
  if (!professions) {
    return res.status(200).json({}).end()
  }
  return res.json(professions.profession)
})

router.get('/best-contractors', async (req, res) => {
  const { Profile, Contract, Job } = req.app.get('models')
  const startDate = new Date(req.query.startDate)
  const endDate = new Date(req.query.endDate)
  endDate.setDate(endDate.getDate() + 1)

  const profiles = await Profile.findAll({
    attributes: {
      include: [[Sequelize.fn('SUM', Sequelize.col('contractor.jobs.price')), 'sumJobs']]
    },
    include: {
      model: Contract,
      as: 'contractor',
      required: true,
      attributes: [],
      include: {
        model: Job,
        as: 'jobs',
        required: true,
        attributes: [],
        where: {
          paid: true,
          paymentDate: {
            [Op.gte]: startDate,
            [Op.lt]: endDate
          }

        }
      }
    },
    group: ['contractor.contractorId'],
    order: [['sumJobs', 'DESC']]
  }

  )
  return res.json(profiles)
})

router.get('/best-clients', async (req, res) => {
  const { Profile, Contract, Job } = req.app.get('models')
  const startDate = new Date(req.query.startDate)
  const limit = (req.query.limit || 2)
  const endDate = new Date(req.query.endDate)
  endDate.setDate(endDate.getDate() + 1)

  const profiles = await Profile.findAll({
    subQuery: false,
    attributes: ['id',
      // DataType.VIRTUAL used on Profile, but don't work without bring first and LastName :-)
      [Sequelize.literal("firstName || ' ' || lastName"), 'fullName'],
      [Sequelize.fn('SUM', Sequelize.col('client.jobs.price')), 'paid']
    ],

    include: {
      model: Contract,
      as: 'client',
      required: true,
      attributes: [],
      include: {
        model: Job,
        as: 'jobs',
        required: true,
        attributes: [],
        where: {
          paid: true,
          paymentDate: {
            [Op.gte]: startDate,
            [Op.lt]: endDate
          }

        }
      }
    },
    group: ['client.clientId'],
    order: [['paid', 'DESC']],
    limit
  }

  )
  return res.json(profiles)
})

router.post('/balances/deposit/:userId', async (req, res) => {
  const { Profile, Contract, Job } = req.app.get('models')
  const id = req.params.userId
  const value = req.body.value
  const client = await Profile.findOne({
    where: {
      id,
      type: CLIENT
    }
  })

  const jobsSum = await Job.sum('price', {
    where: {
      paid: false
    },
    include: {
      model: Contract,
      as: 'contract',
      where: {
        clientId: id
      }
    }
  }
  )
  const newBalance = client.balance + value
  if (!jobsSum || ((newBalance) > (jobsSum * 1.25))) {
    return res.status(422).json({ error: 'Open Values: ' + jobsSum + " . Can't be more than 25% of your open values to paid, " }).end()
  } else {
    await client.update({ balance: (newBalance) })
  }

  return res.json('Deposit has been done. Total Balance: ' + client.balance)
})

module.exports = router
