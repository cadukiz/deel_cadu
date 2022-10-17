const express = require('express')
const bodyParser = require('body-parser')
const { sequelize } = require('./models')
const { Sequelize } = require('./models')
const { getProfile } = require('./middleware/getProfile')
const { IN_PROGRESS } = require('./enums/contract-status')
const { CLIENT } = require('./enums/profile-types')
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

app.get('/profiles/:id', getProfile, async (req, res) => {
  const id = req.params.id
  const { Profile } = req.app.get('models')
  const profile = await Profile.findAll({
    where: {
      id
    }
  })
  res.json(profile)
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

app.get('/jobs', getProfile, async (req, res) => {
  const { Job, Contract } = req.app.get('models')
  const contracts = await Job.findAll({
    where: {

    },
    include: {
      model: Contract,
      as: 'contract',
      where: {
        status: 'in_progress',
        [Op.or]: [
          {
            contractorId: req.profile.id
          },
          {
            clientId: req.profile.id
          }
        ]
      }
    }
  })
  res.json(contracts)
})

app.get('/jobs/unpaid', getProfile, async (req, res) => {
  const { Job, Contract } = req.app.get('models')
  const jobs = await Job.findAll({
    where: {
      paid: {
        [Op.eq]: false
      }
    },
    include: {
      model: Contract,
      as: 'contract',
      where: {
        status: IN_PROGRESS,
        [Op.or]: [
          {
            contractorId: req.profile.id
          },
          {
            clientId: req.profile.id
          }
        ]
      }
    }
  })
  res.json(jobs)
})

app.post('/jobs/:job_id/pay', getProfile, async (req, res) => {
  const { Job, Contract } = req.app.get('models')
  const id = req.params.job_id
  const job = await Job.findOne({
    where: {
      id,
      paid: false
    },
    include: {
      model: Contract,
      as: 'contract',
      where: {
        status: IN_PROGRESS,
        clientId: req.profile.id
      },
      include: ['contractor', 'client']
    }
  })

  if (!job) {
    return res.status(422).end()
  }

  const client = job.contract.client
  const contractor = job.contract.contractor

  if (client.balance >= job.price) {
    const clientNewBalance = client.balance - job.price
    const contractorNewBalance = contractor.balance + job.price
    await client.update({ balance: clientNewBalance })
    await contractor.update({ balance: (contractorNewBalance) })
    await job.update({ paid: true, paymentDate: new Date() })
    return res.json(client)
  } else {
    return res.status(422).end()
  }
})

app.post('/balances/deposit/:userId', async (req, res) => {
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

  if (!jobsSum || ((client.balance + value) > (jobsSum * 1.25))) {
    return res.status(422).json({ error: "Can't be more than 25% of your open values to paid" }).end()
  } else {
    await client.update({ balance: (client.balance + value) })
  }

  return res.json(jobsSum)
})

app.get('/admin/best-profession', async (req, res) => {
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

app.get('/admin/best-contractors', async (req, res) => {
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

app.get('/admin/best-clients', async (req, res) => {
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

module.exports = app
