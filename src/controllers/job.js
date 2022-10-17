const { Op } = require('sequelize')
const { IN_PROGRESS } = require('../enums/contract-status')
const JobService = require('../services/job')

class JobController {
  constructor () {
    this.jobService = new JobService()
  }

  async index (req, res) {
    const { Job, Contract } = req.app.get('models')
    const contracts = await Job.findAll({
      where: {

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
    res.json(contracts)
  }

  async unpaid (req, res) {
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
  }

  async pay (req, res) {
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
  }
}

module.exports = JobController
